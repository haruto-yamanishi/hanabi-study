import { MasteryLevel, SkillState, Skill, Evidence } from './types';

export const levels: MasteryLevel[] = ['unassessed','exposed','assisted','independent','transferable'];

export function levelFromScore(score:number, assistedScore:number): MasteryLevel {
  if (score >= 85) return 'transferable';
  if (score >= 55) return 'independent';
  if (assistedScore >= 35) return 'assisted';
  if (score > 0 || assistedScore > 0) return 'exposed';
  return 'unassessed';
}

export function defaultState(): SkillState {
  return { level:'unassessed', score:0, confidence:0, assistedScore:0 };
}

export function updateFromDiagnostic(current:SkillState, correct:boolean, confidence:number): SkillState {
  const confidenceNorm = Math.max(1, Math.min(5, confidence));
  const increment = correct ? 24 + confidenceNorm * 2 : 0;
  const penalty = correct ? 0 : Math.max(3, confidenceNorm * 2);
  const score = Math.max(0, Math.min(100, current.score + increment - penalty));
  const assistedScore = current.assistedScore;
  return {
    score,
    assistedScore,
    confidence: confidenceNorm,
    lastAssessed: new Date().toISOString(),
    level: levelFromScore(score, assistedScore),
  };
}

export function updateFromEvidence(current:SkillState, evidence:Evidence): SkillState {
  const independent = evidence.aiUse === 'no-ai' || evidence.aiUse === 'hint-only';
  const transferBonus = evidence.kind === 'transfer' ? 18 : evidence.kind === 'derivation' || evidence.kind === 'implementation' ? 12 : 8;
  const score = independent ? Math.min(100, current.score + Math.round(evidence.strength * transferBonus / 5)) : current.score;
  const assistedScore = independent ? current.assistedScore : Math.min(100, current.assistedScore + Math.round(evidence.strength * 12 / 5));
  return {...current, score, assistedScore, level:levelFromScore(score, assistedScore), lastAssessed:new Date().toISOString()};
}

export function domainStats(skills:Skill[], states:Record<string,SkillState>) {
  const domains = Array.from(new Set(skills.map(s=>s.domain)));
  return domains.map(domain=>{
    const set = skills.filter(s=>s.domain===domain);
    const score = set.reduce((a,s)=>a+(states[s.id]?.score ?? 0),0) / set.length;
    const assisted = set.reduce((a,s)=>a+(states[s.id]?.assistedScore ?? 0),0) / set.length;
    const assessed = set.filter(s=>(states[s.id]?.score ?? 0)>0 || (states[s.id]?.assistedScore ?? 0)>0).length;
    return {domain,score,assisted,assessed,total:set.length,gap:Math.max(0,assisted-score)};
  });
}

export function foundationDebt(skills:Skill[], states:Record<string,SkillState>, evidence:Evidence[]) {
  const active = new Set(evidence.map(e=>e.skillId));
  return skills.map(skill=>{
    const state = states[skill.id];
    const isAdvancedActivity = active.has(skill.id) || (state?.assistedScore ?? 0) >= 25 || (state?.score ?? 0) >= 40;
    if (!isAdvancedActivity) return null;
    const missing = skill.prerequisites.filter(p=>(states[p]?.score ?? 0) < 55);
    if (!missing.length) return null;
    return {skill,missing,severity:missing.length * skill.importance};
  }).filter(Boolean).sort((a:any,b:any)=>b.severity-a.severity) as {skill:Skill,missing:string[],severity:number}[];
}

export function nextSkills(skills:Skill[], states:Record<string,SkillState>) {
  return skills.map(skill=>{
    const state=states[skill.id] ?? defaultState();
    const missing=skill.prerequisites.filter(p=>(states[p]?.score ?? 0)<55);
    const blocking = missing.length;
    const ready = blocking===0;
    const value = skill.importance*10 + (ready?25:0) - state.score - blocking*8;
    return {skill,state,missing,ready,value};
  }).filter(x=>x.state.score<85).sort((a,b)=>b.value-a.value);
}
