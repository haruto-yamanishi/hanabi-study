import { BANK_REVISION, getQuestion, topics, topicQuestionIds, type BankQuestion } from '@/data/foundations';
import type { Topic } from '@/data/foundations/types';
export type BankRecord = {
  id:string;revision:number;attempts:number;correct:number;lastAt:number;dueAt:number;
  stage:number;qualifiedAt:number;delayedCorrect:number;lastResult:'correct'|'wrong'|'assisted';
  answer:string;correction:string;checkPassed:boolean;checkPassedAt?:number;lastWrongAt?:number;
};
export type BankRecords=Record<string,BankRecord>;
export const bankIntervals=[0,6,24,72,168,336,720].map(h=>h*3600000);
// Numeric syntax only; never evaluate user input as JavaScript.
export function parseNumeric(raw:string):number|undefined {
  const s=raw.trim().normalize('NFKC').replace(/[−–]/g,'-');
  const number='[+-]?(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:[eE][+-]?\\d+)?';
  if(!new RegExp(`^${number}(?:\\s*/\\s*${number})?$`).test(s))return;
  const parts=s.split('/').map(x=>Number(x.trim()));
  if(parts.length===2 && parts[1]===0)return;
  const n=parts.length===2?parts[0]/parts[1]:parts[0];
  return Number.isFinite(n)?n:undefined;
}
export function gradeNumeric(question:BankQuestion,raw:string) {
  const value=parseNumeric(raw);
  return value!==undefined && Math.abs(value-question.answer)<=(Number.isInteger(question.answer)?1e-9:Math.max(1e-10,Math.abs(question.answer)*1e-5));
}
export function nextBankRecord(question:BankQuestion,previous:BankRecord|undefined,input:{answer:string;correction:string;usedHint:boolean;mode:'practice'|'check'|'placement';now:number;skipped?:boolean}):BankRecord {
  if(!input.skipped&&parseNumeric(input.answer)===undefined)throw new Error('有限の数値または分数を入力してください。');
  const correct=!input.skipped&&gradeNumeric(question,input.answer);
  const old=previous?.revision===question.revision?previous:undefined;
  const independent=correct&&!input.usedHint;
  const testCredit=question.heldOut&&independent&&((input.mode==='check'&&!old)||(input.mode==='placement'&&(!old||input.now-old.lastAt>=6*3600000)));
  const qualifies=independent&&(!old?.qualifiedAt||input.now-old.qualifiedAt>=6*3600000);
  const stage=!independent?0:Math.min((old?.stage??0)+(qualifies?1:0),bankIntervals.length-1);
  const qualifiedAt=!independent?0:qualifies?input.now:(old?.qualifiedAt??input.now);
  return {id:question.id,revision:question.revision,attempts:(old?.attempts??0)+1,correct:(old?.correct??0)+(correct?1:0),
    lastAt:input.now,dueAt:independent?qualifiedAt+bankIntervals[stage]:input.now,
    stage,qualifiedAt,delayedCorrect:!independent?0:(old?.delayedCorrect??0)+(qualifies&&!!old?.qualifiedAt?1:0),
    lastResult:!correct?'wrong':input.usedHint?'assisted':'correct',answer:input.answer.slice(0,200),correction:input.correction.slice(0,2000),
    checkPassed:!!old?.checkPassed || testCredit,
    checkPassedAt:testCredit?input.now:old?.checkPassedAt??(old?.checkPassed?old.lastAt:undefined),
    lastWrongAt:!correct?input.now:old?.lastWrongAt??(old?.lastResult==='wrong'?old.lastAt:undefined),
  };
}
export function validBankRecord(value:unknown):value is BankRecord {
  if(!value||typeof value!=='object')return false;
  const r=value as BankRecord;
  return typeof r.id==='string' && !!getQuestion(r.id) && r.revision===BANK_REVISION &&
    Number.isInteger(r.attempts)&&r.attempts>0&&Number.isInteger(r.correct)&&r.correct>=0&&r.correct<=r.attempts&&
    ['correct','wrong','assisted'].includes(r.lastResult)&&Number.isInteger(r.stage)&&r.stage>=0&&r.stage<bankIntervals.length&&
    Number.isInteger(r.delayedCorrect)&&r.delayedCorrect>=0&&r.delayedCorrect<r.attempts&&
    [r.lastAt,r.dueAt,r.qualifiedAt].every(n=>Number.isFinite(n)&&n>=0)&&typeof r.answer==='string'&&r.answer.length<=200&&
    [r.checkPassedAt,r.lastWrongAt].every(n=>n===undefined||(Number.isFinite(n)&&n>=0))&&typeof r.correction==='string'&&r.correction.length<=2000&&typeof r.checkPassed==='boolean';
}
export function topicProgress(t:Topic,records:BankRecords) {
  const rs=Object.values(records).filter(r=>r.id.startsWith(`bank:${t.id}:`)&&r.revision===BANK_REVISION);
  return progressFromRows(t,rs);
}
function progressFromRows(t:Topic,rs:BankRecord[]) {
  const cutoffs=t.families.map((_,i)=>Math.max(0,...rs.filter(r=>r.id.startsWith('bank:'+t.id+':'+i+':')).map(r=>r.lastWrongAt??(r.lastResult==='wrong'?r.lastAt:0))));
  const passed=t.families.map((_,i)=>rs.filter(r=>r.id.startsWith('bank:'+t.id+':'+i+':')&&r.checkPassed&&(r.checkPassedAt??r.lastAt)>cutoffs[i]).length);
  const retained=t.families.map((_,i)=>rs.some(r=>r.id.startsWith('bank:'+t.id+':'+i+':')&&r.delayedCorrect>=1&&r.lastResult==='correct'&&r.qualifiedAt>cutoffs[i]));
  const testPassed=passed.every(n=>n>=2),retainedReady=testPassed&&retained.every(Boolean);
  return {attempted:rs.length,correct:rs.filter(r=>r.lastResult==='correct').length,passed,retained,testPassed,retainedReady,
    score:passed.reduce((sum,n)=>sum+Math.min(2,n)*25,0),needsReview:cutoffs.some(c=>c>0)&&!testPassed,ready:testPassed};
}

export function bankProgress(records:BankRecords) {
  const grouped:Record<string,BankRecord[]>={};
  for(const r of Object.values(records))if(r.revision===BANK_REVISION){const id=r.id.split(':')[1];(grouped[id]??=[]).push(r);}
  return Object.fromEntries(topics.map(t=>[t.id,progressFromRows(t,grouped[t.id]??[])]));
}
export function selectBankSet(t:Topic,records:BankRecords,mode:'practice'|'check'|'review',now=Date.now()):string[] {
  const ids=topicQuestionIds(t,mode==='check'?'check':'practice');
  if(mode==='review') return Object.values(records).filter(r=>r.id.startsWith(`bank:${t.id}:`)&&r.revision===BANK_REVISION&&r.dueAt<=now).sort((a,b)=>a.dueAt-b.dueAt).slice(0,10).map(r=>r.id);
  // Held-out questions are first-exposure checks; previously seen items go to review instead.
  if(mode==='check')return ids.filter(id=>!records[id]||records[id].revision!==BANK_REVISION).slice(0,10);
  const due=ids.filter(id=>records[id]?.revision===BANK_REVISION&&records[id].dueAt<=now).sort((a,b)=>records[a].dueAt-records[b].dueAt);
  const unseen=ids.filter(id=>!records[id]||records[id].revision!==BANK_REVISION);
  return [...due.slice(0,4),...unseen,...due.slice(4)].slice(0,10);
}
export function missingFoundations(t:Topic,records:BankRecords) {return t.prerequisites.filter(id=>!topicProgress(topics.find(p=>p.id===id)!,records).ready);}

export function needsRemediation(record:BankRecord){return record.lastResult!=='correct'&&record.attempts>=2;}

export function bankPlacementItems(t:Topic,records:BankRecords,retest=false,now=Date.now()):string[]{
  const progress=topicProgress(t,records),ids=topicQuestionIds(t,'check');
  return t.families.flatMap((_,family)=>{
    const needed=retest?2:Math.max(0,2-progress.passed[family]);
    const pool=ids.filter(id=>getQuestion(id)!.family===family);
    const unseen=pool.filter(id=>!records[id]||records[id].revision!==BANK_REVISION);
    const cutoff=Math.max(0,...Object.values(records).filter(r=>r.revision===BANK_REVISION&&r.id.startsWith(`bank:${t.id}:${family}:`)).map(r=>r.lastWrongAt??(r.lastResult==='wrong'?r.lastAt:0)));
    const reusable=pool.filter(id=>records[id]?.revision===BANK_REVISION&&now-records[id].lastAt>=6*3600000&&(retest||!records[id].checkPassed||(records[id].checkPassedAt??records[id].lastAt)<=cutoff)).sort((a,b)=>records[a].lastAt-records[b].lastAt);
    return [...unseen,...reusable].slice(0,needed);
  });
}
