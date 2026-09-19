import { AssessmentOutcome, Competency, Evidence, Skill, SkillState, SkillStatus } from './types';

export function defaultState(): SkillState {
  return { score: 0, assistedScore: 0, retentionScore: 0 };
}

const competencyWeight: Record<Competency, number> = {
  recall: 5,
  explain: 7,
  calculate: 8,
  reproduce: 10,
  transfer: 12,
  debug: 14,
  design: 14,
};

export function skillStatus(state: SkillState, hasLearningActivity = false): SkillStatus {
  if (state.score >= 82 && state.retentionScore >= 35) return 'mastered';
  if (hasLearningActivity || state.score > 0 || state.assistedScore > 0 || state.retentionScore > 0) return 'learning';
  return 'not-started';
}

export function skillMasteryScore(state: SkillState) {
  // Immediate performance dominates, but retained performance matters enough that a
  // one-session spike cannot create a high domain score by itself.
  return Math.min(100, state.score * .82 + state.retentionScore * .18);
}

export function updateFromAssessment(current: SkillState, outcome: AssessmentOutcome, competency: Competency, source: 'baseline'|'checkpoint'|'review'): SkillState {
  const w = competencyWeight[competency];
  let score = current.score;
  let retentionScore = current.retentionScore;
  if (outcome === 'correct') {
    const sourceFactor = source === 'checkpoint' ? 1.15 : source === 'review' ? 0.9 : 0.75;
    score = Math.min(100, score + Math.round(w * sourceFactor));
    if (source === 'review') retentionScore = Math.min(100, retentionScore + Math.max(8, Math.round(w * 1.2)));
  } else if (outcome === 'wrong') {
    score = Math.max(0, score - Math.max(2, Math.round(w * .35)));
    if (source === 'review') retentionScore = Math.max(0, retentionScore - 8);
  } else if (source === 'review') {
    retentionScore = Math.max(0, retentionScore - 5);
  }
  return { ...current, score, retentionScore, lastAssessed: new Date().toISOString() };
}

export function updateFromEvidence(current: SkillState, evidence: Evidence): SkillState {
  const independent = evidence.aiUse === 'no-ai' || evidence.aiUse === 'hint-only';
  const weight = evidence.kind === 'transfer' || evidence.kind === 'debugging' ? 12 : evidence.kind === 'implementation' || evidence.kind === 'derivation' ? 9 : 6;
  const delta = Math.round(evidence.strength * weight / 5);
  const score = independent ? Math.min(100, current.score + delta) : current.score;
  const assistedScore = independent ? current.assistedScore : Math.min(100, current.assistedScore + delta);
  const retentionScore = evidence.kind === 'retention' && independent ? Math.min(100, current.retentionScore + delta) : current.retentionScore;
  return { ...current, score, assistedScore, retentionScore, lastAssessed: new Date().toISOString() };
}

export function domainStats(skills: Skill[], states: Record<string, SkillState>) {
  const domains = Array.from(new Set(skills.map(s => s.domain)));
  return domains.map(domain => {
    const set = skills.filter(s => s.domain === domain);
    const weight = set.reduce((a, s) => a + s.importance, 0) || 1;
    const score = set.reduce((a, s) => a + skillMasteryScore(states[s.id] ?? defaultState()) * s.importance, 0) / weight;
    const assisted = set.reduce((a, s) => a + (states[s.id]?.assistedScore ?? 0) * s.importance, 0) / weight;
    const retention = set.reduce((a, s) => a + (states[s.id]?.retentionScore ?? 0) * s.importance, 0) / weight;
    const assessed = set.filter(s => skillStatus(states[s.id] ?? defaultState()) !== 'not-started').length;
    return { domain, score, assisted, retention, assessed, total: set.length, gap: Math.max(0, assisted - score) };
  });
}

export function foundationDebt(skills: Skill[], states: Record<string, SkillState>, evidence: Evidence[]) {
  const active = new Set(evidence.map(e => e.skillId));
  return skills.map(skill => {
    const state = states[skill.id] ?? defaultState();
    const isActive = active.has(skill.id) || state.score >= 35 || state.assistedScore >= 25;
    if (!isActive) return null;
    const missing = skill.prerequisites.filter(p => (states[p]?.score ?? 0) < 55);
    if (!missing.length) return null;
    return { skill, missing, severity: missing.length * skill.importance };
  }).filter(Boolean).sort((a: any, b: any) => b.severity - a.severity) as { skill: Skill; missing: string[]; severity: number }[];
}

export function nextSkills(skills: Skill[], states: Record<string, SkillState>) {
  return skills.map(skill => {
    const state = states[skill.id] ?? defaultState();
    const missing = skill.prerequisites.filter(p => (states[p]?.score ?? 0) < 55);
    const ready = missing.length === 0;
    const value = skill.importance * 10 + (ready ? 30 : 0) - state.score - missing.length * 10;
    return { skill, state, missing, ready, value };
  }).filter(x => skillStatus(x.state) !== 'mastered').sort((a, b) => b.value - a.value);
}
