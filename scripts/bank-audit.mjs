import assert from 'node:assert/strict';
import fs from 'node:fs';
import {loadTs} from './load-ts.mjs';
const {topics,bankSize,VARIANTS,PRACTICE_VARIANTS,getQuestion,questionId,workedExamples}=loadTs('data/foundations/index.ts');
const {courseGroups}=loadTs('data/foundations/types.ts');
const {foundationBridge}=loadTs('data/foundations/bridge.ts');
const {skills}=loadTs('data/curriculum.ts');
const {gradeNumeric}=loadTs('lib/problem-bank.ts');
assert.equal(topics.length,100);assert.equal(bankSize,100000);
const ids=new Set(topics.map(t=>t.id));assert.equal(ids.size,topics.length);
const visited=new Set(), visiting=new Set();
function visit(id){assert(ids.has(id),`missing prerequisite ${id}`);assert(!visiting.has(id),`cycle ${id}`);if(visited.has(id))return;visiting.add(id);for(const p of topics.find(t=>t.id===id).prerequisites)visit(p);visiting.delete(id);visited.add(id);}
for(const t of topics)visit(t.id);
for(const skill of skills)assert(ids.has(foundationBridge[skill.id]),`missing legacy bridge ${skill.id}`);
const prompts=new Set();const counts={};let count=0;
for(const t of topics){
  for(const key of ['theory','pitfall','explain','explainAnswer'])assert(t[key]?.length>10,`${t.id}: ${key}`);
  assert.equal(t.families.length,2);
  for(const ex of workedExamples(t))assert(Number.isFinite(ex.answer));
  for(let family=0;family<2;family++)for(let seed=0;seed<VARIANTS;seed++){
    const id=questionId(t.id,family,seed),item=getQuestion(id);
    assert(item&&Number.isFinite(item.answer),`finite answer ${id}`);
    assert(!prompts.has(item.prompt),`duplicate prompt ${id}: ${item.prompt}`);prompts.add(item.prompt);
    assert(item.explanation.length>=10,`explanation ${id}`);
    assert.equal(item.heldOut,seed>=PRACTICE_VARIANTS);
    assert(gradeNumeric(item,String(item.answer)),`exact answer ${id}`);
    assert(gradeNumeric(item,Number(item.answer.toPrecision(8)).toString()),`display precision ${id}`);
    assert(!gradeNumeric(item,String(item.answer+Math.max(1,Math.abs(item.answer)*0.1))),`incorrect rejection ${id}`);
    assert.deepEqual(getQuestion(id),item,`deterministic ${id}`);
    count++;
  }
  counts[t.group]=(counts[t.group]??0)+2*VARIANTS;
}
assert.equal(count,bankSize);
const report={schemaVersion:1,revision:1,topics:topics.length,problemFamilies:topics.length*2,questions:count,practiceQuestions:topics.length*2*PRACTICE_VARIANTS,heldOutQuestions:topics.length*2*(VARIANTS-PRACTICE_VARIANTS),counting:'Fixed parameter variants of 200 authored problem families; repeated attempts and lesson examples excluded.',domains:Object.entries(counts).map(([id,questions])=>({id,name:courseGroups[id],topics:topics.filter(t=>t.group===id).length,questions})),curriculum:topics.map(t=>({id:t.id,title:t.title,group:t.group,prerequisites:t.prerequisites,families:t.families.map(f=>f.name)}))};
if(process.argv.includes('--write'))fs.writeFileSync('docs/problem-bank-manifest.json',JSON.stringify(report,null,2)+'\n');
else assert.deepEqual(JSON.parse(fs.readFileSync('docs/problem-bank-manifest.json','utf8')),report,'manifest is stale; run npm run bank:manifest');
console.log(`Problem bank: ${topics.length} topics / ${topics.length*2} families / ${count.toLocaleString()} unique prompts; prerequisites, legacy bridges, generation and grading — OK`);
console.table(report.domains.map(({name,topics,questions})=>({name,topics,questions})));
