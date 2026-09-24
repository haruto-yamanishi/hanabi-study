import type { VocabularyEntry } from './vocabulary';

export type WordStatus = 'unknown' | 'meaning' | 'usable';
export type WordProgress = {
  id: string;
  status: WordStatus;
  lastAnsweredAt: string;
  nextReviewAt: string;
  reviewStage: number;
  stable: boolean;
  lastProductionDay?: string;
};
export type Answer = { meaningKnown: boolean; productionCorrect: boolean | null; revealedAnswer?: boolean };
export type Attempt = {
  id: string;
  wordId: string;
  source: 'daily' | 'diagnostic';
  at: string;
  dayKey: string;
  before?: WordStatus;
  after: WordStatus;
  meaningKnown: boolean;
  productionCorrect: boolean | null;
};
export type DailyPlan = { dayKey: string; ids: string[]; doneIds: string[]; createdAt: string; startStatuses: Record<string, WordStatus | null> };

export function dayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function dateAfter(days: number, from: Date): string {
  const date = new Date(from.getFullYear(), from.getMonth(), from.getDate() + days, 4);
  return date.toISOString();
}

// The scheduler is deliberately separate from status transitions.
export function nextReview(previous: WordProgress | undefined, status: WordStatus, answer: Answer, now: Date): Pick<WordProgress, 'nextReviewAt' | 'reviewStage' | 'stable' | 'lastProductionDay'> {
  const today = dayKey(now);
  if (status !== 'usable') return { nextReviewAt: dateAfter(1, now), reviewStage: 0, stable: false };
  const spacedSuccess = previous?.status === 'usable' && previous.lastProductionDay !== today && answer.productionCorrect === true && !answer.revealedAnswer;
  const stage = spacedSuccess ? Math.min(previous.reviewStage + 1, 5) : previous?.status === 'usable' ? previous.reviewStage : 0;
  const stable = stage >= 4;
  const intervals = [1, 3, 7, 14, 30, 60];
  return { nextReviewAt: dateAfter(stable ? 60 : intervals[stage], now), reviewStage: stage, stable, lastProductionDay: today };
}

export function applyAnswer(previous: WordProgress | undefined, answer: Answer, now: Date): WordProgress {
  const produced = answer.productionCorrect === true && !answer.revealedAnswer;
  const status: WordStatus = !answer.meaningKnown ? 'unknown' : produced ? 'usable' : 'meaning';
  return { id: previous?.id ?? '', status, lastAnsweredAt: now.toISOString(), ...nextReview(previous, status, answer, now) };
}

export function makeAttempt(wordId: string, source: Attempt['source'], previous: WordProgress | undefined, next: WordProgress, answer: Answer, now: Date): Attempt {
  return { id: crypto.randomUUID(), wordId, source, at: now.toISOString(), dayKey: dayKey(now), before: previous?.status, after: next.status, meaningKnown: answer.meaningKnown, productionCorrect: answer.productionCorrect };
}

export function statusCounts(progress: Record<string, WordProgress>) {
  const counts = { unknown: 0, meaning: 0, usable: 0 };
  for (const item of Object.values(progress)) counts[item.status]++;
  return counts;
}

type Bucket = 'unknown' | 'meaning' | 'usable' | 'new';
const bucketLimits: Record<Bucket, number> = { unknown: 60, meaning: 45, usable: 25, new: 20 };

export function selectDailyWords(entries: VocabularyEntry[], progress: Record<string, WordProgress>, now: Date, startBand = 4, carryIds: string[] = []): string[] {
  const today = dayKey(now), cutoff = now.getTime();
  const byId = new Map(entries.map(entry => [entry.id, entry]));
  const selected: string[] = [], used = new Set<string>(), counts: Record<Bucket, number> = { unknown: 0, meaning: 0, usable: 0, new: 0 };
  const add = (id: string, bucket: Bucket) => { if (selected.length < 150 && !used.has(id) && byId.has(id)) { selected.push(id); used.add(id); counts[bucket]++; } };
  for (const id of carryIds) {
    const item = progress[id];
    if (item) add(id, item.status === 'unknown' ? 'unknown' : item.status === 'meaning' ? 'meaning' : 'usable');
  }
  const sorted = [...entries].sort((a, b) => {
    const pa = progress[a.id], pb = progress[b.id];
    const dueA = pa?.nextReviewAt ?? '', dueB = pb?.nextReviewAt ?? '';
    if (pa && pb && dueA !== dueB) return dueA.localeCompare(dueB);
    const distance = Math.abs(a.difficulty - startBand) - Math.abs(b.difficulty - startBand);
    return distance || a.id.localeCompare(b.id);
  });
  const pools: Record<Bucket, string[]> = { unknown: [], meaning: [], usable: [], new: [] };
  const early: Record<Bucket, string[]> = { unknown: [], meaning: [], usable: [], new: [] };
  for (const entry of sorted) {
    if (used.has(entry.id)) continue;
    const item = progress[entry.id];
    if (!item) { pools.new.push(entry.id); continue; }
    if (item.stable && item.status === 'usable' && new Date(item.nextReviewAt).getTime() > cutoff) continue;
    const pool = new Date(item.nextReviewAt).getTime() <= cutoff ? pools : early;
    pool[item.status].push(entry.id);
  }
  for (const bucket of ['unknown', 'meaning', 'usable', 'new'] as Bucket[]) for (const id of pools[bucket].slice(0, Math.max(0, bucketLimits[bucket] - counts[bucket]))) add(id, bucket);
  const activeCount = Object.keys(progress).length;
  const newLimit = activeCount < 60 ? 90 : 45;
  for (const bucket of ['unknown', 'meaning', 'usable'] as Bucket[]) for (const id of pools[bucket]) add(id, bucket);
  for (const bucket of ['unknown', 'meaning', 'usable'] as Bucket[]) for (const id of early[bucket]) add(id, bucket);
  for (const id of pools.new) if (counts.new < newLimit) add(id, 'new');
  return selected;
}

export function makeDailyPlan(entries: VocabularyEntry[], progress: Record<string, WordProgress>, now: Date, startBand: number, carryIds: string[] = []): DailyPlan {
  const ids = selectDailyWords(entries, progress, now, startBand, carryIds);
  return { dayKey: dayKey(now), ids, doneIds: [], createdAt: now.toISOString(), startStatuses: Object.fromEntries(ids.map(id => [id, progress[id]?.status ?? null])) };
}

export function dailyGains(plan: DailyPlan, progress: Record<string, WordProgress>) {
  let unknownToMeaning = 0, meaningToUsable = 0;
  for (const id of plan.doneIds) {
    const before = plan.startStatuses[id], after = progress[id]?.status;
    if (before === 'unknown' && (after === 'meaning' || after === 'usable')) unknownToMeaning++;
    if (before === 'meaning' && after === 'usable') meaningToUsable++;
  }
  return { unknownToMeaning, meaningToUsable };
}
