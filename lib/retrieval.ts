import type { RetrievalAttempt } from './types';

const hour = 60 * 60 * 1000;
// Product defaults, not an attribution to Hira or a scientific guarantee.
export const retrievalIntervals = [0, 6 * hour, 24 * hour, 72 * hour, 168 * hour];
export function retrievalProgress(cardId: string, revision: number, attempts: RetrievalAttempt[], now = Date.now()) {
  const history = attempts.filter(a=>a.cardId===cardId && a.revision===revision)
    .slice().sort((a,b)=>Date.parse(a.createdAt)-Date.parse(b.createdAt));
  let passes = 0, qualifiedAt: number | undefined;
  for (const a of history) {
    const time = Date.parse(a.createdAt);
    if (a.outcome === 'again') { passes = 0; qualifiedAt = undefined; }
    else if (qualifiedAt === undefined || time - qualifiedAt >= 6 * hour) {
      passes++; qualifiedAt = time;
    }
  }
  const last = history.at(-1);
  // Same-session repetition does not count as delayed recall or postpone its due date.
  const dueAt = !last ? 0 : last.outcome === 'again' ? Date.parse(last.createdAt)
    : (qualifiedAt ?? Date.parse(last.createdAt)) + retrievalIntervals[Math.min(passes, retrievalIntervals.length-1)];
  return { attempts:history.length, passes, last, dueAt, due:dueAt<=now, delayedPasses:Math.max(0,passes-1) };
}

export function insertRetry(queue: string[], currentIndex: number, cardId: string) {
  // Wait for up to two other prompts; do not add the same card twice to the remaining queue.
  if (queue.slice(currentIndex+1).includes(cardId)) return queue;
  const next = [...queue];
  next.splice(Math.min(currentIndex+3,next.length),0,cardId);
  return next;
}

export function validRetrievalAttempt(value: unknown): value is RetrievalAttempt {
  if (!value || typeof value !== 'object') return false;
  const a = value as RetrievalAttempt;
  return typeof a.id==='string' && typeof a.cardId==='string' && Number.isInteger(a.revision) && a.revision>0 &&
    ['again','explained','fluent'].includes(a.outcome) && typeof a.response==='string' && a.response.trim().length>0 &&
    typeof a.correction==='string' && (a.outcome!=='again'||a.correction.trim().length>0) &&
    Number.isFinite(a.elapsedSec) && a.elapsedSec>=0 && typeof a.createdAt==='string' && Number.isFinite(Date.parse(a.createdAt));
}
