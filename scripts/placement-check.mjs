import assert from 'node:assert/strict';
import {loadTs} from './load-ts.mjs';
const storage=new Map();
globalThis.localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
globalThis.window={localStorage};
const {useMasteryStore:store}=loadTs('lib/store.ts');
const {skills}=loadTs('data/curriculum.ts');
const {skillStatus,nextSkills}=loadTs('lib/mastery.ts');
const {skillTestItems,placementEvidence}=loadTs('lib/placement.ts');
const {topics,getQuestion,topicQuestionIds}=loadTs('data/foundations/index.ts');
const {bankPlacementItems,nextBankRecord,topicProgress,validBankRecord}=loadTs('lib/problem-bank.ts');
for(const skill of skills){
  store.getState().reset();
  const items=skillTestItems(skill.id,[]);
  assert.equal(new Set(items.map(q=>q.id)).size,4,skill.id);
  assert(new Set(items.map(q=>q.competency)).size>=2,skill.id);
  for(const q of items)store.getState().answerAssessment(q,'correct','placement');
  const state=store.getState().states[skill.id];
  assert.equal(skillStatus(state),'mastered',skill.id);
  assert.equal(state.retentionScore,0,'placement does not invent retention');
  assert(!nextSkills(skills,store.getState().states).some(row=>row.skill.id===skill.id),'passed nodes leave the learning recommendations');
  assert.deepEqual(store.getState().lessonProgress,{},'placement does not invent lesson submissions');
  assert(JSON.parse(storage.get('hanabi-study-v2')).state.states[skill.id].testPassed);
  for(const source of ['placement','review','checkpoint']){
    store.getState().answerAssessment(items[0],'wrong',source);
    assert.equal(store.getState().states[skill.id].testPassed,false);
    assert(store.getState().states[skill.id].score<=75);
    const retry=skillTestItems(skill.id,store.getState().assessmentHistory);
    assert.equal(retry.length,4);
    for(const q of retry)store.getState().answerAssessment(q,'correct','placement');
    assert.equal(skillStatus(store.getState().states[skill.id]),'mastered');
  }
}
const snapshot=JSON.parse(JSON.stringify(store.getState()));
store.getState().reset();store.getState().importData(snapshot);
assert(store.getState().states[skills.at(-1).id].testPassed,'import preserves placement');
const other=JSON.stringify(store.getState().states[skills.at(-1).id]);
const first=skillTestItems(skills[0].id,[])[0];
for(let i=0;i<8;i++)store.getState().answerAssessment(first,'correct','placement');
assert(!store.getState().states[first.skillId].testPassed,'one repeated item cannot pass');
assert.equal(JSON.stringify(store.getState().states[skills.at(-1).id]),other,'unrelated skill untouched');
const stale=store.getState().assessmentHistory.filter(a=>a.skillId===first.skillId).map(a=>({...a,revision:-1}));
assert.equal(placementEvidence(first.skillId,stale).count,0);
assert.equal(skillTestItems(first.skillId,stale).length,4,'stale history cannot shorten a test');
store.getState().answerAssessment(skillTestItems(skills.at(-1).id,[])[0],'skipped','placement');
assert(!store.getState().states[skills.at(-1).id].testPassed);

let now=1000000;
const records={};
const answer=(id,correct=true,extra={})=>{const q=getQuestion(id);return records[id]=nextBankRecord(q,records[id],{answer:String(correct?q.answer:q.answer+1),correction:'',usedHint:false,mode:'placement',now:++now,...extra});};
for(const t of topics){
  const ids=bankPlacementItems(t,records,false,now);
  assert.equal(ids.length,4,t.id);
  assert.equal(new Set(ids).size,4);
  ids.forEach(id=>answer(id));
  const p=topicProgress(t,records);
  assert(p.ready&&p.testPassed&&!p.retainedReady,t.id);
  assert.equal(p.score,100);
  assert.equal(bankPlacementItems(t,records,false,now).length,0);
  assert.equal(bankPlacementItems(t,records,true,now).length,4);
}
const t=topics[0],unrelated=topicProgress(topics[1],records);
const wrong=topicQuestionIds(t,'practice')[0];
answer(wrong,false,{mode:'practice'});
assert.equal(topicProgress(t,records).score,50);
assert(topicProgress(t,records).needsReview);
answer(wrong,true,{mode:'practice'});
assert.equal(topicProgress(t,records).score,50,'correcting same problem cannot resurrect revoked credit');
assert.deepEqual(topicProgress(topics[1],records),unrelated);
const retry=bankPlacementItems(t,records,false,now);
assert.equal(retry.length,2);
retry.forEach(id=>answer(id));assert.equal(topicProgress(t,records).score,100);
answer(retry[0],false,{skipped:true});
assert.equal(topicProgress(t,records).score,50);
answer(retry[0]);assert.equal(topicProgress(t,records).score,50,'immediate repeat is not new test evidence');
assert(Object.values(records).every(validBankRecord));
const legacy={...records[retry[1]]};delete legacy.checkPassedAt;delete legacy.lastWrongAt;
assert(validBankRecord(legacy),'older exports remain valid');
const hintId=bankPlacementItems(t,records,false,now)[0];answer(hintId,true,{usedHint:true});
assert.equal(topicProgress(t,records).score,50,'hints do not award placement');
// Exhaust the held-out pool. Reassessment selects expired evidence, not already valid credits.
const exhausted={};const all=topicQuestionIds(t,'check');
for(const id of all){const q=getQuestion(id);exhausted[id]=nextBankRecord(q,undefined,{answer:'0',correction:'',usedHint:false,mode:'placement',now:now++,skipped:true});}
assert.equal(bankPlacementItems(t,exhausted,false,now).length,0);
now+=6*3600000;
const available=bankPlacementItems(t,exhausted,false,now);assert.equal(available.length,4);
for(const id of available){const q=getQuestion(id);exhausted[id]=nextBankRecord(q,exhausted[id],{answer:String(q.answer),correction:'',usedHint:false,mode:'placement',now:++now});}
assert.equal(topicProgress(t,exhausted).score,100);
console.log('Placement checks: all 78 skills and 100 topics, credit, rollback, recovery, persistence, stale/repeated evidence, hints, skipped answers, pool exhaustion — OK');
