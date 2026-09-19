import { AssessmentItem, Lesson, Skill } from './types';

export function coverageForSkill(skill: Skill, lessons: Lesson[], assessments: AssessmentItem[]) {
  const ls = lessons.filter(l => l.skillId === skill.id);
  const items = assessments.filter(a => a.skillId === skill.id);
  const needsDebugDesign = ['cs','electronics','mechanical','control','robotics'].includes(skill.domain);
  const has = {
    concept: ls.some(l => l.steps.some(s => s.kind === 'concept')),
    example: ls.some(l => l.steps.some(s => s.kind === 'example')),
    recall: ls.some(l => l.steps.some(s => s.kind === 'recall')) || items.some(a => a.competency === 'recall'),
    practice: ls.some(l => l.steps.some(s => s.kind === 'practice')) || items.some(a => ['calculate','reproduce'].includes(a.competency)),
    transfer: items.some(a => a.competency === 'transfer'),
    checkpoint: ls.some(l => l.checkpointIds.length > 0),
    review: items.some(a => !!a.variantGroup && assessments.some(b => b.id !== a.id && b.variantGroup === a.variantGroup)),
    debugDesign: !needsDebugDesign || items.some(a => a.competency === 'debug' || a.competency === 'design'),
    frc: skill.frcApplications.length > 0,
  };
  const values = Object.values(has);
  return {
    has,
    percent: Math.round(values.filter(Boolean).length / values.length * 100),
    basic: has.concept && has.example && has.recall && has.practice && has.checkpoint,
    full: values.every(Boolean),
  };
}

export function domainCoverage(skills: Skill[], lessons: Lesson[], assessments: AssessmentItem[]) {
  const domains = Array.from(new Set(skills.map(s => s.domain)));
  return domains.map(domain => {
    const set = skills.filter(s => s.domain === domain);
    const avg = set.reduce((a, s) => a + coverageForSkill(s, lessons, assessments).percent, 0) / (set.length || 1);
    return {
      domain,
      percent: Math.round(avg),
      basic: set.filter(s => coverageForSkill(s, lessons, assessments).basic).length,
      full: set.filter(s => coverageForSkill(s, lessons, assessments).full).length,
      total: set.length,
    };
  });
}
