import { topics, getQuestion, topicQuestionIds } from '@/data/foundations';
import type { BankRecords } from './problem-bank';
export type Diagnostic = {origin:string;candidate:string;queue:string[];path:string[];probe:0|1;recommendation?:string;passed:string[]};
export function beginDiagnostic(origin:string):Diagnostic{
  const t=topics.find(t=>t.id===origin);
  if(!t)throw new Error('単元が見つかりません。');
  return {origin,candidate:origin,queue:[...t.prerequisites],path:[origin],probe:0,passed:[],recommendation:t.prerequisites.length?undefined:origin};
}
export function diagnosticQuestion(state:Diagnostic,records:BankRecords){
  const t=topics.find(t=>t.id===state.queue[0]);
  if(!t)return;
  const ids=topicQuestionIds(t).filter(id=>getQuestion(id)!.family===state.probe);
  // Small-number basic probes first; previous exposure is explicit and never confers mastery.
  return getQuestion(ids.find(id=>!records[id])??ids[0]);
}
export function advanceDiagnostic(state:Diagnostic,correct:boolean):Diagnostic{
  if(state.recommendation||!state.queue.length)return state;
  const id=state.queue[0],t=topics.find(t=>t.id===id)!;
  if(!correct)return {...state,candidate:id,queue:[...t.prerequisites],path:[...state.path,id],probe:0,recommendation:t.prerequisites.length?undefined:id};
  if(state.probe===0)return {...state,probe:1};
  const queue=state.queue.slice(1);
  return {...state,queue,probe:0,passed:[...state.passed,id],recommendation:queue.length?undefined:state.candidate};
}
export type BankSession={ids:string[];mode:'practice'|'check'|'review';index:number};
export type BankJourney={originTopicId:string;originQuestionId?:string;targetTopicId:string;path:string[];returnSession:BankSession|null};
export function validBankJourney(value:unknown):value is BankJourney{
  if(!value||typeof value!=='object')return false;
  const j=value as BankJourney;
  return topics.some(t=>t.id===j.originTopicId)&&topics.some(t=>t.id===j.targetTopicId)&&
    (!j.originQuestionId||getQuestion(j.originQuestionId)?.topicId===j.originTopicId)&&
    Array.isArray(j.path)&&j.path.every(id=>topics.some(t=>t.id===id))&&
    (j.returnSession===null || (!!j.returnSession&&Array.isArray(j.returnSession.ids)&&j.returnSession.ids.length<=1000&&j.returnSession.ids.every(id=>getQuestion(id)?.topicId===j.originTopicId)&&['practice','check','review'].includes(j.returnSession.mode)&&Number.isInteger(j.returnSession.index)&&j.returnSession.index>=0&&j.returnSession.index<j.returnSession.ids.length));
}
// Immediate drill readiness is deliberately separate from spaced retention.
export function recoveryReadiness(topicId:string,records:BankRecords){
  return [0,1].map(f=>Object.values(records).filter(r=>r.id.startsWith(`bank:${topicId}:${f}:`)&&r.lastResult==='correct').length>=2).every(Boolean);
}
