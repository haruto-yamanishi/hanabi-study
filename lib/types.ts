export type Domain = 'math'|'physics'|'cs'|'electronics'|'mechanical'|'control'|'robotics'|'ai';
export type MasteryLevel = 'unassessed'|'exposed'|'assisted'|'independent'|'transferable';
export type AiUse = 'no-ai'|'hint-only'|'ai-explanation'|'ai-debugging'|'ai-generated';

export type Skill = {
  id: string;
  domain: Domain;
  nameJa: string;
  nameEn: string;
  description: string;
  prerequisites: string[];
  importance: number;
  x: number;
  y: number;
};

export type Resource = {
  id: string;
  title: string;
  provider: string;
  url: string;
  skills: string[];
  format: string;
  note: string;
};

export type DiagnosticQuestion = {
  id: string;
  skillId: string;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
  difficulty: 1|2|3;
};

export type Evidence = {
  id: string;
  skillId: string;
  kind: 'diagnostic'|'explanation'|'derivation'|'implementation'|'debugging'|'transfer';
  title: string;
  detail: string;
  aiUse: AiUse;
  strength: number;
  createdAt: string;
};

export type SkillState = {
  level: MasteryLevel;
  score: number;
  confidence: number;
  assistedScore: number;
  lastAssessed?: string;
};
