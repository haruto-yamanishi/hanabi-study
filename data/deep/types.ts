import type { AssessmentItem } from '@/lib/types';
export type Recall = [prompt: string, answer: string];
export type Problem = Pick<AssessmentItem, 'prompt'|'format'|'answer'|'explanation'|'options'|'tolerance'|'competency'>;
export type DeepUnit = {
  skillId: string; title: string; theory: string; worked: string;
  recall: [Recall, Recall]; problems: [Problem, Problem];
  challenge: string; solution: string;
};
export const numeric = (prompt: string, answer: number, explanation: string): Problem =>
  ({prompt,format:'numeric',answer:String(answer),tolerance:0.001,explanation,competency:'calculate'});
export const decision = (prompt: string, options: string[], answer: number, explanation: string): Problem =>
  ({prompt,format:'mcq',options,answer,explanation,competency:'transfer'});
export const deep = (skillId: string, title: string, theory: string, worked: string,
  recall: [Recall, Recall], problems: [Problem, Problem], challenge: string, solution: string): DeepUnit =>
  ({skillId,title,theory,worked,recall,problems,challenge,solution});
