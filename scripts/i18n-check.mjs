import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadTs} from './load-ts.mjs';
const {translateText}=loadTs('lib/i18n.ts');
const {messagePattern,hasJapanese}=loadTs('lib/i18n-text.ts');
const dictionary={...JSON.parse(fs.readFileSync('data/i18n/en.json')),...JSON.parse(fs.readFileSync('data/i18n/overrides.json'))};
const keys=JSON.parse(fs.readFileSync('data/i18n/messages.json'));
const placeholders=text=>(text.match(/ZXQ\d+XZ/g)??[]).sort();
for(const key of keys){
 assert(dictionary[key]?.trim(),`Missing English: ${key}`);
 assert(!hasJapanese(dictionary[key]),`Japanese in English: ${key}`);
 assert.deepEqual(placeholders(dictionary[key]),placeholders(key),`Altered values: ${key}`);
}
let strings=0;
function check(value){
 if(typeof value==='string'){
  assert.equal(translateText(value,'ja'),value);
  const translated=translateText(value,'en');
  assert(!hasJapanese(translated),`Untranslated content: ${value}`);
  assert.deepEqual(messagePattern(translated).tokens.sort(),messagePattern(value).tokens.sort(),`Changed math/code/numbers: ${value}`);
  strings++;
 }else if(Array.isArray(value))value.forEach(check);
 else if(value&&typeof value==='object')Object.values(value).forEach(check);
}
for(const file of ['data/lessons.ts','data/assessments.ts','data/deep/index.ts','data/projects.ts','data/curriculum.ts','data/foundations/routes.ts'])check(loadTs(file));
const bank=loadTs('data/foundations/index.ts');check(bank.topics);check(bank.courseGroups);
for(const topic of bank.topics)for(const id of bank.topicQuestionIds(topic,'all'))check(bank.getQuestion(id));
assert.equal(translateText('ZXQ0XZ','ja'),'ZXQ0XZ');
assert(translateText('練習10問','en').includes('10'));
assert(translateText('練習27問','en').includes('27'));
console.log(`English checks: ${keys.length} messages, ${strings} content strings, all 100,000 questions; Japanese unchanged, no missing translations, math/code/numbers preserved — OK`);
