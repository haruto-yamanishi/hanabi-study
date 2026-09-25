import assert from 'node:assert/strict';
import test from 'node:test';
import raw from '../data/catalog.json';
import { answerDiagnostic, startDiagnostic } from '../lib/diagnostic';
import { applyAnswer, dailyGains, dateAfter, makeDailyPlan, selectDailyWords, type WordProgress } from '../lib/learning';
import type { VocabularyEntry } from '../lib/vocabulary';

const entries = raw as VocabularyEntry[];
const now = new Date('2026-09-24T14:00:00-04:00');
const progress = (id: string, status: WordProgress['status'], due = '2026-09-23T08:00:00Z'): WordProgress => ({ id, status, lastAnsweredAt: '2026-09-22T08:00:00Z', nextReviewAt: due, reviewStage: 0, stable: false });

test('only unaided production can create usable status', () => {
  const unknown = applyAnswer(undefined, { meaningKnown: false, productionCorrect: null }, now);
  assert.equal(unknown.status, 'unknown');
  const meaning = applyAnswer(unknown, { meaningKnown: true, productionCorrect: null }, now);
  assert.equal(meaning.status, 'meaning');
  assert.equal(applyAnswer(meaning, { meaningKnown: true, productionCorrect: true, revealedAnswer: true }, now).status, 'meaning');
  const usable = applyAnswer(meaning, { meaningKnown: true, productionCorrect: true }, now);
  assert.equal(usable.status, 'usable');
  assert.equal(applyAnswer(usable, { meaningKnown: true, productionCorrect: false }, now).status, 'meaning');
  assert.equal(applyAnswer(usable, { meaningKnown: false, productionCorrect: false }, now).status, 'unknown');
});

test('review grows by spaced days and stable words leave normal selection', () => {
  let item = { ...applyAnswer(undefined, { meaningKnown: true, productionCorrect: true }, now), id: 'abate-verb' };
  assert.equal(item.nextReviewAt, dateAfter(1, now));
  for (const [days, interval] of [[1, 3], [4, 7], [11, 14], [25, 60]] as const) {
    const reviewDate = new Date(now.getTime() + days * 86400_000);
    item = applyAnswer(item, { meaningKnown: true, productionCorrect: true }, reviewDate);
    assert.equal(item.reviewStage, [1, 4, 11, 25].indexOf(days) + 1);
    assert.equal(item.nextReviewAt, dateAfter(interval, reviewDate));
  }
  assert(item.stable);
  const selected = selectDailyWords(entries, { [item.id]: item }, now, 7);
  assert(!selected.includes(item.id));
});

test('daily plan picks unique words, limits new words and reports gains', () => {
  const many: VocabularyEntry[] = Array.from({ length: 260 }, (_, i) => ({ ...entries[i % entries.length], id: `word-${i}`, lemma: `word${i}`, example: `The word${i} appears here.` }));
  const states: Record<string, WordProgress> = {};
  for (let i = 0; i < 80; i++) states[`word-${i}`] = progress(`word-${i}`, 'unknown');
  for (let i = 80; i < 140; i++) states[`word-${i}`] = progress(`word-${i}`, 'meaning');
  for (let i = 140; i < 170; i++) states[`word-${i}`] = progress(`word-${i}`, 'usable');
  const plan = makeDailyPlan(many, states, now, 4);
  assert.equal(plan.ids.length, 150);
  assert.equal(new Set(plan.ids).size, 150);
  assert(plan.ids.filter(id => !states[id]).length <= 45);
  assert(plan.ids.filter(id => states[id]?.status === 'unknown').length >= 60);
  const id = plan.ids.find(id => states[id]?.status === 'unknown')!;
  plan.doneIds.push(id);
  states[id] = { ...states[id], status: 'meaning' };
  assert.equal(dailyGains(plan, states).unknownToMeaning, 1);
  const repeat = selectDailyWords(many, states, now, 4, [id, id]);
  assert.equal(new Set(repeat).size, repeat.length);
});

test('diagnostic descends on failures, ascends on success and never labels untested words', () => {
  let session = startDiagnostic(entries, now);
  assert.equal(session.band, 4);
  for (let i = 0; i < 8; i++) session = answerDiagnostic(session, entries, session.pendingIds[0], 'unknown', now);
  assert.equal(session.band, 3);
  for (let i = 0; i < 8; i++) session = answerDiagnostic(session, entries, session.pendingIds[0], 'usable', now);
  assert(session.finished);
  assert(session.recommendedBand);
  assert.equal(session.responses.length, 16);
  assert(session.responses.every(response => ['unknown', 'usable'].includes(response.status)));
});

test('diagnostic spot checks a borderline band without repeating words', () => {
  let session = startDiagnostic(entries, now);
  const first = [...session.pendingIds];
  for (let i = 0; i < 8; i++) session = answerDiagnostic(session, entries, session.pendingIds[0], i < 4 ? 'meaning' : 'unknown', now);
  assert.equal(session.band, 4);
  assert.equal(session.pendingIds.length, 4);
  assert(session.pendingIds.every(id => !first.includes(id)));
  for (let i = 0; i < 4; i++) session = answerDiagnostic(session, entries, session.pendingIds[0], 'meaning', now);
  assert(session.finished);
  assert.equal(session.responses.length, 12);
  assert.equal(new Set(session.responses.map(response => response.wordId)).size, 12);
});
