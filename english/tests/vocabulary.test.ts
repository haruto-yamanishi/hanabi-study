import assert from 'node:assert/strict';
import test from 'node:test';
import raw from '../data/catalog.json';
import { auditCatalog, cloze, productionAnswer, validateEntry, type VocabularyEntry } from '../lib/vocabulary';

const entries = raw as VocabularyEntry[];
test('seed catalog is valid and has usable cloze prompts', () => {
  const result = auditCatalog(entries);
  assert.deepEqual(result.errors, []);
  assert.equal(entries.length, 148);
  for (const entry of entries) {
    assert(cloze(entry).includes('_____'), entry.id);
    assert(productionAnswer(entry, entry.answerForm ?? entry.lemma), entry.id);
    assert(!productionAnswer(entry, 'not-a-word'), entry.id);
  }
});
test('duplicate IDs and normalized lemma plus part of speech are rejected', () => {
  const copy = { ...entries[0], id: 'new-id', lemma: entries[0].lemma.toUpperCase() };
  const result = auditCatalog([entries[0], copy, entries[0]]);
  assert(result.errors.some(error => error.includes('duplicate lemma + pos')));
  assert(result.errors.some(error => error.includes('duplicate id')));
});
test('invalid production example is rejected', () => {
  assert(validateEntry({ ...entries[0], example: 'This example omits the answer.' }).some(error => error.includes('example')));
});
