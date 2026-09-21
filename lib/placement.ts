import { assessments } from '@/data/assessments';
import type { AssessmentAttempt, SkillState } from './types';

// Four distinct items and at least two competencies; repeating one item cannot fill a node.
export function placementEvidence(skillId:string,history:AssessmentAttempt[]){
  const latest=new Map<string,AssessmentAttempt>();
  for(let i=history.length-1;i>=0;i--){const a=history[i];if(a.skillId!==skillId)continue;if(a.outcome!=='correct')break;
    const item=assessments.find(q=>q.id===a.itemId&&q.skillId===skillId&&q.revision===a.revision);
    if(item&&!latest.has(a.itemId))latest.set(a.itemId,{...a,competency:item.competency});
  }
  const competencies=new Set([...latest.values()].map(a=>a.competency));
  return {count:latest.size,competencies:competencies.size,passed:latest.size>=4&&competencies.size>=2};
}
export function applyPlacementCredit(state:SkillState,attempt:AssessmentAttempt,history:AssessmentAttempt[]):SkillState{
  if(attempt.outcome!=='correct')return state;
  const evidence=placementEvidence(attempt.skillId,[...history,attempt]);
  if(!evidence.passed)return state;
  return {...state,score:Math.max(state.score,90),testPassed:true,testPassedAt:attempt.createdAt};
}
export function skillTestItems(skillId:string,history:AssessmentAttempt[],retest=false){
  const items=assessments.filter(a=>a.skillId===skillId);
  const recent=history.filter(a=>a.skillId===skillId);
  const lastWrong=recent.map(a=>a.outcome!=='correct').lastIndexOf(true);
  const since=retest?[]:recent.slice(lastWrong+1).filter(a=>items.some(q=>q.id===a.itemId&&q.revision===a.revision)),passed=new Set(since.filter(a=>a.outcome==='correct').map(a=>a.itemId));
  const seen=new Map(recent.map((a,i)=>[a.itemId,i]));
  const candidates=items.filter(a=>!passed.has(a.id)).sort((a,b)=>(seen.get(a.id)??-1)-(seen.get(b.id)??-1)||a.difficulty-b.difficulty);
  const needed=Math.max(1,4-passed.size),chosen:typeof items=[];
  const competencies=new Set(items.filter(a=>passed.has(a.id)).map(a=>a.competency));
  while(chosen.length<needed&&candidates.length){const ix=candidates.findIndex(a=>!competencies.has(a.competency));const [item]=candidates.splice(ix<0?0:ix,1);chosen.push(item);competencies.add(item.competency);}
  return chosen.length?chosen:items.slice(0,4);
}
