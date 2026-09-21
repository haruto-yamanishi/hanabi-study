import { questionDifficulty } from './difficulty';
import { basicTopics } from './basic';
import { algebraTopics } from './algebra';
import { linearTopics } from './linear';
import { calculusTopics } from './calculus';
import { probabilityTopics } from './probability';
import { discreteTopics } from './discrete';
import { physicsTopics } from './physics';
import { engineeringTopics } from './engineering';
import type { Topic, Question } from './types';
export { courseGroups } from './types';
export const topics: Topic[] = [...basicTopics,...algebraTopics,...linearTopics,...calculusTopics,...probabilityTopics,...discreteTopics,...physicsTopics,...engineeringTopics];
export const VARIANTS = 500;
export const PRACTICE_VARIANTS = 400;
export const BANK_REVISION = 1;
export const bankSize = topics.reduce((sum,t)=>sum+t.families.length*VARIANTS,0);
export type BankQuestion = Question & {id:string;topicId:string;family:number;seed:number;revision:number;heldOut:boolean;difficulty:'basic'|'standard'};
const topicMap = new Map(topics.map(t=>[t.id,t]));
export function questionId(topicId:string,family:number,seed:number) { return `bank:${topicId}:${family}:${seed}`; }
export function getQuestion(id:string): BankQuestion | undefined {
  const [prefix,topicId,fam,variant,...rest] = id.split(':');
  const t = topicMap.get(topicId), family=Number(fam), seed=Number(variant);
  if(prefix!=='bank'||rest.length||!t||!/^\d+$/.test(fam??'')||!/^\d+$/.test(variant??'')||!Number.isInteger(family)||family<0||family>=t.families.length||!Number.isInteger(seed)||seed<0||seed>=VARIANTS||id!==questionId(topicId,family,seed))return;
  return {...t.families[family].make(seed),id,topicId,family,seed,revision:BANK_REVISION,heldOut:seed>=PRACTICE_VARIANTS,difficulty:questionDifficulty(topicId)};
}
export function topicQuestionIds(t:Topic,mode:'practice'|'check'|'all'='practice') {
  const start=mode==='check'?PRACTICE_VARIANTS:0, end=mode==='practice'?PRACTICE_VARIANTS:VARIANTS;
  const ids:string[]=[];
  for(let seed=start;seed<end;seed++)for(let family=0;family<t.families.length;family++)ids.push(questionId(t.id,family,seed));
  return ids;
}
// Reuse small-number practice cases for approachable examples; do not count the examples again.
export function workedExamples(t:Topic) { return t.families.map(f=>({...f.make(0),name:f.name})); }
