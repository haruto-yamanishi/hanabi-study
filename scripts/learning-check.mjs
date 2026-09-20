import assert from 'node:assert/strict';
import { loadTs } from './load-ts.mjs';

// Real store persistence, without a browser dependency.
const storage = new Map();
globalThis.localStorage = {
  getItem: key => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
  removeItem: key => storage.delete(key),
};
globalThis.window = { localStorage: globalThis.localStorage };
const { simulateElevator, defaultControlParameters } = loadTs('lib/control-simulation.ts');
const { practicalReady, workshopChecks } = loadTs('lib/graduation.ts');
const { useMasteryStore } = loadTs('lib/store.ts');
const { engineeringLessons, engineeringAssessments } = loadTs('data/engineering.ts');
const { lessons } = loadTs('data/lessons.ts');
const { assessments, baselineAssessments } = loadTs('data/assessments.ts');
const { projects } = loadTs('data/projects.ts');

const nominal = simulateElevator(defaultControlParameters);
assert.equal(nominal.length, 601);
assert(Math.abs(nominal.at(-1).position - 0.6) < 0.02, 'nominal response settles near target');
assert.equal(nominal.at(-1).reference, 0.6);
for (const params of [defaultControlParameters, {...defaultControlParameters, mass:8,voltageLimit:4}, {...defaultControlParameters,kp:100,ki:50,kd:0,delay:true,antiWindup:false}]) {
  const trace = simulateElevator(params);
  assert(trace.every(p => Object.values(p).every(Number.isFinite)), 'finite model output');
  assert(trace.every(p => p.position >= 0 && Math.abs(p.voltage) <= params.voltageLimit), 'floor and voltage constraints');
  const velocities = trace.slice(1).map((p,i)=>(p.reference-trace[i].reference)/0.01);
  assert(velocities.every(v => v >= -1e-9 && v <= 0.8+1e-9), 'reference speed constraint');
  assert(velocities.slice(1).every((v,i)=>Math.abs(v-velocities[i])/0.01 <= 1+1e-8), 'reference acceleration constraint');
}
const limited = simulateElevator({...defaultControlParameters, voltageLimit:4, antiWindup:true});
const windup = simulateElevator({...defaultControlParameters, voltageLimit:4, antiWindup:false});
assert(Math.abs(limited.at(-1).integral) < Math.abs(windup.at(-1).integral), 'anti-windup prevents saturation accumulation');
assert(limited.at(-1).position < 0.01, 'insufficient force cannot lift load');

const checks = workshopChecks.map(c=>c.id);
const note = {id:'eng-m-number',notes:'目的と条件、成果物の保存先、期待値と測定値、失敗の原因と改善方法を記録した再現可能な実習報告です。',mode:'simulation',checks,reviewer:'',updatedAt:new Date().toISOString()};
assert(!practicalReady(undefined, checks));
assert(!practicalReady({...note,notes:''},checks));
assert(!practicalReady({...note,checks:[]},checks));
assert(practicalReady(note,checks));
assert(!practicalReady(note,checks,true));
assert(practicalReady({...note,reviewer:'担当者・2026-09-20'},checks,true));

useMasteryStore.getState().reset();
useMasteryStore.getState().savePractical(note);
assert.deepEqual(useMasteryStore.getState().states,{},'self-reported notes do not award mastery');
assert.equal(useMasteryStore.getState().practicalSubmissions[note.id].notes,note.notes);
assert(JSON.parse(storage.get('hanabi-study-v2')).state.practicalSubmissions[note.id], 'notes persisted under existing storage key');
const snapshot=JSON.parse(JSON.stringify(useMasteryStore.getState()));
useMasteryStore.getState().reset();
assert.deepEqual(useMasteryStore.getState().practicalSubmissions,{});
useMasteryStore.getState().importData(snapshot);
assert.equal(useMasteryStore.getState().practicalSubmissions[note.id].notes,note.notes,'export/import round trip');
useMasteryStore.getState().importData({states:{'m-number':{score:20,assistedScore:0,retentionScore:0}},lessonProgress:{'l-algebra-equations':{completed:true}}});
assert.deepEqual(useMasteryStore.getState().practicalSubmissions,{},'older exports need no new fields');
assert.equal(useMasteryStore.getState().states['m-number'].score,20);
assert(useMasteryStore.getState().lessonProgress['l-algebra-equations'].completed);
assert(lessons.some(l=>l.id==='l-algebra-equations'),'existing lesson IDs retained');
assert(baselineAssessments.every(Boolean),'baseline references remain valid');

const item=engineeringAssessments.find(a=>a.id==='eng-m-number-calc-2');
useMasteryStore.getState().answerAssessment(item,'correct','checkpoint');
const queued=useMasteryStore.getState().reviewQueue.find(r=>r.originalItemId===item.id);
assert.equal(queued.itemId,'eng-m-number-calc-1','review uses a different authored variant');
assert(new Date(queued.dueAt).getTime()>Date.now(),'review is scheduled later');
assert(engineeringLessons.every(l=>l.checkpointIds.every(id=>assessments.some(a=>a.id===id))));
assert(projects.every(p=>p.skills.every(id=>engineeringLessons.some(l=>l.skillId===id))));
console.log('Learning checks: simulation constraints, anti-windup, portfolio readiness, persistence, legacy import, review variants — OK');
