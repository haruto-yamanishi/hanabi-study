/** Authored content, shared by the lesson player and spaced assessments. */
export type Calculation = [prompt: string, answer: number, explanation: string];
export type Decision = [prompt: string, correct: string, misconceptionA: string, misconceptionB: string, explanation: string];
export type Unit = {
  skillId: string; title: string; concept: string; example: string;
  calculations: [Calculation, Calculation]; decision: Decision; lab: string;
};
export const unit = (skillId: string, title: string, concept: string, example: string,
  first: Calculation, second: Calculation, decision: Decision, lab: string): Unit =>
  ({ skillId, title, concept, example, calculations: [first, second], decision, lab });
