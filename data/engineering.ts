import type { AssessmentItem, Lesson } from '@/lib/types';
import { skills } from './curriculum';
import { mathUnits } from './units/math';
import { physicsUnits } from './units/physics';
import { csUnits } from './units/cs';
import { electronicsUnits } from './units/electronics';
import { mechanicalUnits } from './units/mechanical';
import { controlUnits } from './units/control';
import { roboticsUnits } from './units/robotics';
import { aiUnits } from './units/ai';

export const engineeringUnits = [...mathUnits, ...physicsUnits, ...csUnits, ...electronicsUnits, ...mechanicalUnits, ...controlUnits, ...roboticsUnits, ...aiUnits];
const references: Record<string, string[]> = {
  math: ['res-calc-a','res-linear'], physics: ['res-circuits'], cs: ['res-wpilib-command'],
  electronics: ['res-wpilib-can','res-frc-rules'], mechanical: ['res-frc-rules','res-modern-robotics'],
  control: ['res-wpilib-ff','res-wpilib-pid'], robotics: ['res-modern-robotics','res-wpilib-pose'],
  ai: ['res-ml-course','res-rl-course'],
};

export const engineeringAssessments: AssessmentItem[] = engineeringUnits.flatMap((u, index) => {
  const skill = skills.find(s => s.id === u.skillId)!;
  // Stable rotation avoids placing every correct decision at index zero.
  const answer = index % 3;
  const choices = [u.decision[2], u.decision[3]];
  choices.splice(answer, 0, u.decision[1]);
  return [
    ...u.calculations.map(([prompt, value, explanation], i): AssessmentItem => ({
      id: `eng-${u.skillId}-calc-${i + 1}`, skillId: u.skillId,
      competency: 'transfer', format: 'numeric', difficulty: 3, prompt,
      answer: String(value), tolerance: 0.0001, explanation,
      variantGroup: `eng-${u.skillId}-calculation`, frcContext: skill.frcApplications.join(' / '), revision: 1,
    })),
    { id: `eng-${u.skillId}-decision`, skillId: u.skillId,
      competency: ['cs','electronics','mechanical','control','robotics'].includes(skill.domain) ? 'debug' : 'explain',
      format: 'mcq', difficulty: 4, prompt: u.decision[0], options: choices, answer,
      explanation: u.decision[4], frcContext: skill.frcApplications.join(' / '), revision: 1 } as AssessmentItem,
  ];
});

export const engineeringLessons: Lesson[] = engineeringUnits.map(u => {
  const skill = skills.find(s => s.id === u.skillId)!;
  return {
    id: `eng-${u.skillId}`, skillId: u.skillId, title: u.title,
    summary: `${skill.nameJa}を、原理・計算・判断・実習で身につける。FRC応用：${skill.frcApplications.join('、')}。`,
    estimatedMinutes: ['ai','control','robotics'].includes(skill.domain) ? 55 : 40,
    revision: 1,
    steps: [
      { id: 'concept', kind: 'concept', title: '原理と前提', body: u.concept },
      { id: 'worked', kind: 'example', title: '手順を追って計算する', body: u.example },
      { id: 'recall', kind: 'recall', title: '見ずに理由を説明する',
        body: 'まず自分の言葉で答え、判断の根拠も書き出してください。',
        prompt: u.decision[0], explanation: `${u.decision[1]}。${u.decision[4]}` },
      { id: 'practice', kind: 'practice', title: '計算演習', body: '式と単位を書いてから数値を求めてください。',
        prompt: u.calculations[0][0], numericAnswer: u.calculations[0][1], tolerance: 0.0001, explanation: u.calculations[0][2] },
      { id: 'workshop', kind: 'practice', title: '手を動かす実習と提出物', body: u.lab },
    ],
    // The second calculation changes the conditions; the first returns in spaced review.
    checkpointIds: [`eng-${u.skillId}-calc-2`, `eng-${u.skillId}-decision`],
    resourceIds: references[skill.domain],
    practical: u.lab,
  };
});
