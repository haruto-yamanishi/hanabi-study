'use client';
import Dexie, { type Table } from 'dexie';
import { applyAnswer, dayKey, makeAttempt, makeDailyPlan, type Answer, type Attempt, type DailyPlan, type WordProgress } from './learning';
import { answerDiagnostic, startDiagnostic, type DiagnosticSession } from './diagnostic';
import type { VocabularyEntry } from './vocabulary';

type Meta = { key: string; value: unknown };
class EnglishDB extends Dexie {
  progress!: Table<WordProgress, string>;
  attempts!: Table<Attempt, string>;
  plans!: Table<DailyPlan, string>;
  meta!: Table<Meta, string>;
  constructor() {
    super('HanabiStudyEnglishV1');
    this.version(1).stores({ progress: 'id,status,nextReviewAt,lastAnsweredAt', attempts: 'id,wordId,at,dayKey,source', plans: 'dayKey', meta: 'key' });
  }
}
let instance: EnglishDB | undefined;
export function db(): EnglishDB {
  if (typeof indexedDB === 'undefined') throw new Error('このブラウザでは学習記録を保存できません。');
  return instance ??= new EnglishDB();
}

export type Snapshot = { progress: Record<string, WordProgress>; plan: DailyPlan | null; diagnostic: DiagnosticSession | null; recentAttempts: Attempt[]; startBand: number };
export async function loadSnapshot(now = new Date()): Promise<Snapshot> {
  const database = db();
  const [progressRows, plan, diagnosticMeta, bandMeta, recentAttempts] = await Promise.all([
    database.progress.toArray(), database.plans.get(dayKey(now)), database.meta.get('diagnostic'), database.meta.get('startBand'),
    database.attempts.where('at').aboveOrEqual(new Date(now.getTime() - 14 * 86400_000).toISOString()).toArray(),
  ]);
  return { progress: Object.fromEntries(progressRows.map(row => [row.id, row])), plan: plan ?? null, diagnostic: (diagnosticMeta?.value as DiagnosticSession | null) ?? null, recentAttempts, startBand: typeof bandMeta?.value === 'number' ? bandMeta.value : 4 };
}

export async function ensureToday(entries: VocabularyEntry[], now = new Date()): Promise<DailyPlan> {
  const database = db();
  return database.transaction('rw', database.progress, database.plans, database.meta, async () => {
    const existing = await database.plans.get(dayKey(now));
    if (existing) return existing;
    const [rows, lastPlan, band] = await Promise.all([database.progress.toArray(), database.plans.orderBy('dayKey').last(), database.meta.get('startBand')]);
    const progress = Object.fromEntries(rows.map(row => [row.id, row]));
    const carry = lastPlan?.dayKey !== dayKey(now) ? (lastPlan?.ids.filter(id => !lastPlan.doneIds.includes(id)) ?? []) : [];
    const plan = makeDailyPlan(entries, progress, now, typeof band?.value === 'number' ? band.value : 4, carry);
    await database.plans.put(plan);
    return plan;
  });
}

export async function recordDailyAnswer(wordId: string, answer: Answer, now = new Date()): Promise<void> {
  const database = db();
  await database.transaction('rw', database.progress, database.attempts, database.plans, async () => {
    const plan = await database.plans.get(dayKey(now));
    if (!plan || !plan.ids.includes(wordId) || plan.doneIds.includes(wordId)) throw new Error('今日の学習対象ではありません。');
    const before = await database.progress.get(wordId);
    const after = { ...applyAnswer(before, answer, now), id: wordId };
    await database.progress.put(after);
    await database.attempts.add(makeAttempt(wordId, 'daily', before, after, answer, now));
    await database.plans.put({ ...plan, doneIds: [...plan.doneIds, wordId] });
  });
}

export async function beginDiagnostic(entries: VocabularyEntry[], now = new Date()): Promise<DiagnosticSession> {
  const session = startDiagnostic(entries, now);
  await db().meta.put({ key: 'diagnostic', value: session });
  return session;
}

export async function recordDiagnosticAnswer(entries: VocabularyEntry[], wordId: string, answer: Answer, now = new Date()): Promise<void> {
  const database = db();
  await database.transaction('rw', database.progress, database.attempts, database.meta, database.plans, async () => {
    const meta = await database.meta.get('diagnostic');
    const session = meta?.value as DiagnosticSession | undefined;
    if (!session || session.finished || session.pendingIds[0] !== wordId) throw new Error('診断の出題順が変わりました。再読み込みしてください。');
    const before = await database.progress.get(wordId);
    const after = { ...applyAnswer(before, answer, now), id: wordId };
    const next = answerDiagnostic(session, entries, wordId, after.status, now);
    await database.progress.put(after);
    await database.attempts.add(makeAttempt(wordId, 'diagnostic', before, after, answer, now));
    await database.meta.put({ key: 'diagnostic', value: next });
    if (next.finished) await database.meta.put({ key: 'startBand', value: next.recommendedBand ?? 4 });
    const plan = await database.plans.get(dayKey(now));
    if (plan && plan.doneIds.length === 0) {
      const rows = await database.progress.toArray();
      await database.plans.put(makeDailyPlan(entries, Object.fromEntries(rows.map(row => [row.id, row])), now, next.finished ? (next.recommendedBand ?? 4) : next.band));
    }
  });
}

export async function exportBackup(): Promise<string> {
  const database = db();
  const [progress, attempts, plans, meta] = await Promise.all([database.progress.toArray(), database.attempts.toArray(), database.plans.toArray(), database.meta.toArray()]);
  return JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), progress, attempts, plans, meta }, null, 2);
}

export async function importBackup(text: string, validIds: Set<string>): Promise<void> {
  const value: unknown = JSON.parse(text);
  if (!value || typeof value !== 'object') throw new Error('バックアップ形式が正しくありません。');
  const data = value as Record<string, unknown>;
  if (data.version !== 1 || !Array.isArray(data.progress) || !Array.isArray(data.attempts) || !Array.isArray(data.plans) || !Array.isArray(data.meta)) throw new Error('対応していないバックアップ形式です。');
  const progress = data.progress as WordProgress[], attempts = data.attempts as Attempt[], plans = data.plans as DailyPlan[], meta = data.meta as Meta[];
  const statuses = new Set(['unknown', 'meaning', 'usable']);
  if (progress.some(row => !row || !validIds.has(row.id) || !statuses.has(row.status) || !Number.isInteger(row.reviewStage) || !Number.isFinite(Date.parse(row.nextReviewAt)) || !Number.isFinite(Date.parse(row.lastAnsweredAt))) || new Set(progress.map(row => row.id)).size !== progress.length) throw new Error('単語の学習状態が不正です。');
  if (attempts.some(row => !row || typeof row.id !== 'string' || !validIds.has(row.wordId) || !statuses.has(row.after) || !Number.isFinite(Date.parse(row.at))) || new Set(attempts.map(row => row.id)).size !== attempts.length) throw new Error('回答履歴が不正です。');
  if (plans.some(row => !row || typeof row.dayKey !== 'string' || !Array.isArray(row.ids) || !Array.isArray(row.doneIds) || row.ids.some(id => !validIds.has(id)) || row.doneIds.some(id => !row.ids.includes(id))) || new Set(plans.map(row => row.dayKey)).size !== plans.length) throw new Error('学習予定が不正です。');
  if (meta.some(row => !row || !['diagnostic', 'startBand'].includes(row.key)) || new Set(meta.map(row => row.key)).size !== meta.length) throw new Error('診断情報が不正です。');
  const database = db();
  await database.transaction('rw', database.progress, database.attempts, database.plans, database.meta, async () => {
    await Promise.all([database.progress.clear(), database.attempts.clear(), database.plans.clear(), database.meta.clear()]);
    await database.progress.bulkAdd(progress);
    await database.attempts.bulkAdd(attempts);
    await database.plans.bulkAdd(plans);
    await database.meta.bulkAdd(meta);
  });
}
