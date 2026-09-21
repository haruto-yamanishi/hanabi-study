import assert from 'node:assert/strict';
import {loadTs} from './load-ts.mjs';
const {topics,getQuestion,questionId,topicQuestionIds}=loadTs('data/foundations/index.ts');
const {parseNumeric,gradeNumeric,nextBankRecord,validBankRecord,topicProgress,selectBankSet}=loadTs('lib/problem-bank.ts');
const {beginDiagnostic,advanceDiagnostic,diagnosticQuestion,validBankJourney,recoveryReadiness}=loadTs('lib/remediation.ts');
for(const [raw,n] of [['1/3',1/3],['−２',-2],['1e-3',0.001],['.5',0.5],['-1 / 2',-0.5]])assert.equal(parseNumeric(raw),n);
for(const raw of ['', ' ', '1/0','Infinity','0x10','1+2','alert(1)','1,000','NaN','1e999'])assert.equal(parseNumeric(raw),undefined,raw);
for(const id of ['bank:signed:0:500','bank:signed:2:0','bank:signed:0:-1','bank:signed::0','bank:signed:00:0','bank:missing:0:0'])assert.equal(getQuestion(id),undefined);
// Reference cases calculated independently, spanning every group and sensitive formulas.
const fixtures=[['signed',0,5,-1],['fractions',0,4,13/12],['ratio',1,3,5],['percent',1,3,65],['powers',1,8,.01],['roots',0,7,9],['units',1,3,.05],['scientific',0,3,1],['expand',0,3,9],['factor',1,4,6],['linear-eq',0,5,6],['simultaneous',1,4,6],['quadratic',1,3,37],['inequality',1,3,4],['functions',0,3,5],['exp-log',0,3,5],['pythagoras',1,3,20],['similarity',0,3,25],['trig',1,3,25],['radians',1,3,.2],['vectors',0,3,7],['dot',1,3,3],['matrix',1,3,17],['det',0,3,14],['inverse',1,3,3],['rank',1,3,4],['eigen',1,3,25],['least-squares',1,3,7],['limits',0,3,10],['derivative',0,3,23],['chain',1,3,13],['extrema',0,3,5],['integral',1,3,45],['ftc',1,3,80],['partial',1,3,4.6],['double-integral',1,3,12.5],['sequence',1,3,500],['series',1,3,.625],['epsilon',1,3,.1],['taylor',1,3,.0016],['ode',1,3,-15],['euler',0,3,4],['counting',1,3,30],['conditional',1,3,1/15],['bayes',1,3,1/6],['expectation',1,3,13],['variance',1,3,45],['binomial',1,3,1.25],['mean-ci',1,3,.98],['regression',0,3,4],['sets',0,3,9],['logic',0,3,3],['induction',1,3,25],['modular',1,3,2],['graphs',1,3,10],['complexity',1,3,10],['position',0,3,4],['acceleration',1,3,6.25],['projectile',0,3,10],['newton',0,3,2.5],['incline',1,3,2],['friction',1,3,-3],['work',1,3,10],['energy',1,3,100],['power',1,3,25],['momentum',1,3,25],['collision',1,3,5],['circular',1,3,20],['torque',1,3,7],['inertia',1,3,2.2],['angular',1,3,10],['spring',1,3,.625],['oscillation',1,3,-.5],['statics',1,3,5],['ohm',0,3,2.4],['resistors',1,3,2.5],['wire-loss',0,3,.05],['adc',0,3,25/1024],['rc',1,3,.01],['gear',1,3,8],['stress',1,3,.005],['beam',1,3,90],['tolerance',1,3,.1],['sampling',1,3,.01],['pid',1,3,.101],['feedforward',1,3,.7],['first-order',1,3,1.2],['estimation',1,3,6.25],['transform',0,3,9],['odometry',1,3,.1],['kinematics',1,3,6],['trajectory',1,3,.1],['binary',1,3,-5],['queue',0,3,8],['latency',1,3,.0025],['testing',0,3,2/3],['metrics',1,3,.625],['mse',0,3,14.5],['gradient',1,3,4],['data-split',1,3,-2.5]];
assert.equal(new Set(fixtures.map(x=>x[0])).size,topics.length);
for(const [id,f,seed,expected] of fixtures){const item=getQuestion(questionId(id,f,seed));assert(Math.abs(item.answer-expected)<1e-8,`${id}: ${item.answer} != ${expected}`);}
const now=Date.parse('2026-09-01T00:00:00Z'),hour=3600000,q=getQuestion('bank:signed:0:0');
const submit=(prev,extra={})=>nextBankRecord(q,prev,{answer:String(q.answer),correction:'',usedHint:false,mode:'practice',now,...extra});
let r=submit();assert(validBankRecord(r));assert.equal(r.stage,1);assert.equal(r.dueAt,now+6*hour);
r=submit(r,{now:now+hour});assert.equal(r.stage,1);assert.equal(r.delayedCorrect,0);assert.equal(r.dueAt,now+6*hour);
r=submit(r,{now:now+6*hour});assert.equal(r.stage,2);assert.equal(r.delayedCorrect,1);
r=submit(r,{usedHint:true,now:now+7*hour});assert.equal(r.stage,0);assert.equal(r.lastResult,'assisted');
r=submit(r,{skipped:true,answer:'わからない'});assert.equal(r.lastResult,'wrong');assert(!validBankRecord({...r,correct:-1}));assert(!validBankRecord({...r,dueAt:NaN}));
const check=getQuestion('bank:signed:0:400');let cr=nextBankRecord(check,undefined,{answer:String(check.answer),usedHint:false,mode:'check',correction:'',now});assert(cr.checkPassed);
let wrong=nextBankRecord(check,undefined,{answer:'999',usedHint:false,mode:'check',correction:'符号',now});
wrong=nextBankRecord(check,wrong,{answer:String(check.answer),usedHint:false,mode:'check',correction:'',now});assert(!wrong.checkPassed,'a retry is not a first-exposure pass');
const t=topics[0],records={[cr.id]:cr,[r.id]:r};
assert(!selectBankSet(t,records,'check',now).includes(cr.id));assert(selectBankSet(t,records,'review',now).includes(r.id));
assert(!topicProgress(t,records).ready);assert(!recoveryReadiness(t.id,records));
let diagnostic=beginDiagnostic('pid');let steps=0;
while(!diagnostic.recommendation){assert(diagnosticQuestion(diagnostic,{}));diagnostic=advanceDiagnostic(diagnostic,false);assert(++steps<20);}
assert.equal(diagnostic.recommendation,'signed','can descend from PID to middle-school signed arithmetic');
let pass=beginDiagnostic('derivative');pass=advanceDiagnostic(pass,true);pass=advanceDiagnostic(pass,true);assert.equal(pass.recommendation,'derivative','if tested prerequisites pass, work on current topic');
const journey={originTopicId:'pid',originQuestionId:'bank:pid:0:0',targetTopicId:'signed',path:['pid','signed'],returnSession:{ids:['bank:pid:0:0'],index:0,mode:'practice'}};
assert(validBankJourney(journey));assert(!validBankJourney({...journey,targetTopicId:'missing'}));assert(!validBankJourney({...journey,returnSession:{...journey.returnSession,index:8}}));
console.log('Bank checks: 100 independent reference cases, parsing, spacing, first-exposure checks, hint separation, diagnostics to middle school, journey validation — OK');
// Cross-check calculus templates using numerical operations independent of their closed forms.
for(let i=0;i<500;i++){
  const a=i+2,h=1e-4;
  const finiteDiff=((a*(2+h)**2+3*(2+h))-(a*(2-h)**2+3*(2-h)))/(2*h);
  assert(Math.abs(getQuestion(questionId('derivative',0,i)).answer-finiteDiff)<1e-5);
  const integrate=(x)=>a*x*x;
  const simpson=(3/6)*(integrate(0)+4*integrate(1.5)+integrate(3));
  assert(Math.abs(getQuestion(questionId('integral',1,i)).answer-simpson)<1e-8);
  const ls=getQuestion(questionId('least-squares',1,i)).answer;
  assert(Math.abs((a-ls)+2*(2*a+5-2*ls))<1e-8,'least-squares residual orthogonal to design column');
  const maxCount=getQuestion(questionId('counting',0,i));
  assert(!gradeNumeric(maxCount,String(maxCount.answer+1)),'integer answers cannot be rounded into acceptance');
}
const {bankProgress}=loadTs('lib/problem-bank.ts');
const full={};for(const topic of topics)for(const id of topicQuestionIds(topic,'all')){
  const item=getQuestion(id);full[id]=nextBankRecord(item,undefined,{answer:String(item.answer),correction:'',usedHint:false,mode:item.heldOut?'check':'practice',now});
}
const summary=bankProgress(full);
assert.equal(Object.keys(full).length,100000);assert.equal(Object.values(summary).reduce((n,p)=>n+p.attempted,0),100000);
assert(Object.values(summary).every(p=>p.ready&&!p.retainedReady),'tests permit skipping; one sitting cannot establish retention');
assert.equal(selectBankSet(topics[0],full,'check',now).length,0,'exhausted held-out pool is not reused as first exposure');
assert.equal(selectBankSet(topics[0],full,'review',now+6*hour).length,10);
console.log('Scale and mathematics: 100,000 progress records, bounded sets, numerical differentiation/integration, least-squares residuals, exact integer grading — OK');
const {needsRemediation}=loadTs('lib/problem-bank.ts');
assert(!needsRemediation({...r,attempts:1,lastResult:'wrong'}));
assert(needsRemediation({...r,attempts:2,lastResult:'wrong'}));
assert(!needsRemediation({...r,attempts:5,lastResult:'correct'}));
console.log('Repeated difficulty routes to prerequisite diagnosis — OK');
