import type { VocabularyEntry } from './vocabulary';
import type { WordStatus } from './learning';

export type DiagnosticResponse = { wordId: string; status: WordStatus; band: number };
export type DiagnosticSession = {
  startedAt: string;
  band: number;
  pendingIds: string[];
  responses: DiagnosticResponse[];
  visitedBands: number[];
  spotCheckedBands: number[];
  finished: boolean;
  recommendedBand?: number;
};

function stableHash(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) hash = Math.imul(hash ^ value.charCodeAt(i), 16777619);
  return hash >>> 0;
}
const sample = (entries: VocabularyEntry[], band: number, used: Set<string>, count: number, seed: string) => entries
  .filter(entry => entry.difficulty === band && !used.has(entry.id))
  .sort((a, b) => stableHash(`${seed}:${a.id}`) - stableHash(`${seed}:${b.id}`) || a.id.localeCompare(b.id))
  .slice(0, count).map(entry => entry.id);

export function startDiagnostic(entries: VocabularyEntry[], now = new Date()): DiagnosticSession {
  const band = entries.some(entry => entry.difficulty === 4) ? 4 : Math.max(1, Math.min(8, entries[0]?.difficulty ?? 4));
  return { startedAt: now.toISOString(), band, pendingIds: sample(entries, band, new Set(), 8, now.toISOString()), responses: [], visitedBands: [band], spotCheckedBands: [], finished: false };
}

export function answerDiagnostic(session: DiagnosticSession, entries: VocabularyEntry[], wordId: string, status: WordStatus, now = new Date()): DiagnosticSession {
  if (session.finished || session.pendingIds[0] !== wordId) throw new Error('Unexpected diagnostic word');
  const pendingIds = session.pendingIds.slice(1);
  const responses = [...session.responses, { wordId, status, band: session.band }];
  const updated = { ...session, pendingIds, responses };
  if (pendingIds.length) return updated;
  return advanceDiagnostic(updated, entries, now);
}

export function advanceDiagnostic(session: DiagnosticSession, entries: VocabularyEntry[], now = new Date()): DiagnosticSession {
  if (session.finished || session.pendingIds.length) return session;
  const bandAnswers = session.responses.filter(answer => answer.band === session.band);
  const knownRate = bandAnswers.filter(answer => answer.status !== 'unknown').length / Math.max(1, bandAnswers.length);
  const used = new Set(session.responses.map(answer => answer.wordId));
  const elapsed = now.getTime() - new Date(session.startedAt).getTime();
  if (bandAnswers.length === 8 && knownRate > .25 && knownRate < .75 && !session.spotCheckedBands.includes(session.band)) {
    const more = sample(entries, session.band, used, 4, session.startedAt);
    if (more.length) return { ...session, pendingIds: more, spotCheckedBands: [...session.spotCheckedBands, session.band] };
  }
  const currentKnown = bandAnswers.filter(answer => answer.status !== 'unknown').length / Math.max(1, bandAnswers.length);
  const direction = currentKnown >= .75 ? 1 : currentKnown <= .25 ? -1 : 0;
  const nextBand = session.band + direction;
  const previous = session.visitedBands[session.visitedBands.length - 2];
  const crossed = previous !== undefined && direction !== 0 && Math.sign(session.band - previous) !== direction;
  const stop = direction === 0 || crossed || session.visitedBands.length >= 5 || elapsed >= 30 * 60_000 || nextBand < 1 || nextBand > 8;
  if (stop) {
    const candidates = session.visitedBands.map(band => {
      const answers = session.responses.filter(answer => answer.band === band);
      const unknown = answers.filter(answer => answer.status === 'unknown').length / Math.max(1, answers.length);
      return { band, distance: Math.abs(unknown - .45) };
    }).sort((a, b) => a.distance - b.distance || a.band - b.band);
    return { ...session, finished: true, recommendedBand: candidates[0]?.band ?? session.band };
  }
  const next = sample(entries, nextBand, used, 8, session.startedAt);
  if (!next.length) return { ...session, finished: true, recommendedBand: session.band };
  return { ...session, band: nextBand, pendingIds: next, visitedBands: [...session.visitedBands, nextBand] };
}
