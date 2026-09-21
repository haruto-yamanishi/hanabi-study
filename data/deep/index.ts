import type { AssessmentItem, Lesson } from '@/lib/types';
import { skills, resources } from '../curriculum';
import { mathDeep } from './math';
import { physicsDeep } from './physics';
import { csDeep } from './cs';
import { electronicsDeep } from './electronics';
import { mechanicalDeep } from './mechanical';
import { controlDeep } from './control';
import { roboticsDeep } from './robotics';
import { aiDeep } from './ai';

export const deepUnits = [...mathDeep,...physicsDeep,...csDeep,...electronicsDeep,...mechanicalDeep,...controlDeep,...roboticsDeep,...aiDeep];
export type RetrievalCard = { id: string; skillId: string; lessonId: string; prompt: string; answer: string; revision: number };
export const retrievalCards: RetrievalCard[] = deepUnits.flatMap(u => u.recall.map(([prompt,answer],i) => ({
  id:`recall-${u.skillId}-${i+1}`,skillId:u.skillId,lessonId:`deep-${u.skillId}`,prompt,answer,revision:1,
})));
export const deepAssessments: AssessmentItem[] = deepUnits.flatMap(u => u.problems.map((p,i) => ({
  ...p,id:`deep-${u.skillId}-check-${i+1}`,skillId:u.skillId,difficulty:4,revision:1,
  frcContext:skills.find(s=>s.id===u.skillId)!.frcApplications.join(' / '),
})));
export const deepLessons: Lesson[] = deepUnits.map(u => ({
  id:`deep-${u.skillId}`,skillId:u.skillId,title:u.title,track:'application',
  summary:`${skills.find(s=>s.id===u.skillId)!.nameJa}の次の授業。原理を説明し、別条件の問題と検証課題へ使う。`,
  estimatedMinutes:35,revision:1,prerequisiteLessonIds:[`eng-${u.skillId}`],
  steps:[
    {id:'principle',kind:'concept',title:'原理と適用条件',body:u.theory},
    {id:'worked',kind:'example',title:'途中式・判断を追う例',body:u.worked},
    {id:'explain',kind:'recall',title:'解説を閉じて説明',body:'自分の言葉で式・手順・理由を再現します。答えを覚えているだけでなく、なぜそうなるかを書いてください。',prompt:u.recall[0][0],explanation:u.recall[0][1]},
    {id:'boundary',kind:'recall',title:'適用できない場合も説明',body:'条件や前提が変わると何が変わるか考えます。',prompt:u.recall[1][0],explanation:u.recall[1][1]},
    {id:'transfer',kind:'practice',title:'条件を変えて検証する',body:'先に解法・実装・検証計画を考え、比較ポイントは後から開いてください。',prompt:u.challenge,explanation:u.solution},
    {id:'workshop',kind:'practice',title:'成果物と説明を残す',body:`${u.challenge}\n提出：式・コード・図・測定結果のうち必要なものと、期待値との比較、誤差や失敗の理由。`},
  ],
  checkpointIds:u.problems.map((_,i)=>`deep-${u.skillId}-check-${i+1}`),
  resourceIds:resources.filter(r=>r.skills.includes(u.skillId)).map(r=>r.id),
  practical:`${u.challenge}\n検証・レビューの観点：${u.solution}`,
}));
