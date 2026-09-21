export type Domain = 'math'|'physics'|'cs'|'electronics'|'mechanical'|'control'|'robotics'|'ai';
export type SkillStatus = 'not-started'|'learning'|'mastered';
export type AiUse = 'no-ai'|'hint-only'|'ai-explanation'|'ai-debugging'|'ai-generated';
export type AssessmentOutcome = 'correct'|'wrong'|'skipped';
export type Competency = 'recall'|'explain'|'calculate'|'reproduce'|'transfer'|'debug'|'design';
export type AssessmentFormat = 'mcq'|'numeric';
export type AssessmentSource = 'baseline'|'checkpoint'|'review'|'placement';

export type SchoolMapping = {
  school: string;
  schoolName?: string;
  sourceYear: number;
  courseName: string;
  grade?: number;
  relation: 'direct'|'partial'|'prerequisite'|'extension'|'gap';
  unit?: string;
  note?: string;
};

export type Skill = {
  id: string;
  domain: Domain;
  section: string;
  nameJa: string;
  nameEn: string;
  description: string;
  prerequisites: string[];
  importance: number;
  frcApplications: string[];
  schoolMappings?: SchoolMapping[];
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

export type AssessmentItem = {
  id: string;
  skillId: string;
  competency: Competency;
  format: AssessmentFormat;
  difficulty: 1|2|3|4|5;
  prompt: string;
  options?: string[];
  answer: number|string;
  tolerance?: number;
  explanation: string;
  frcContext?: string;
  variantGroup?: string;
  prerequisites?: string[];
  revision: number;
};

export type LessonStep = {
  id: string;
  kind: 'concept'|'example'|'recall'|'practice';
  title: string;
  body: string;
  prompt?: string;
  options?: string[];
  answer?: number;
  explanation?: string;
  numericAnswer?: number;
  tolerance?: number;
};

export type Lesson = {
  id: string;
  skillId: string;
  title: string;
  summary: string;
  estimatedMinutes: number;
  revision: number;
  steps: LessonStep[];
  checkpointIds: string[];
  resourceIds?: string[];
  practical?: string;
  track?: 'foundation' | 'application';
  prerequisiteLessonIds?: string[];
  assets?: { label: string; url: string }[];
};

export type Evidence = {
  id: string;
  skillId: string;
  kind: 'diagnostic'|'explanation'|'derivation'|'implementation'|'debugging'|'transfer'|'retention';
  title: string;
  detail: string;
  aiUse: AiUse;
  strength: number;
  createdAt: string;
};

export type SkillState = {
  score: number;
  assistedScore: number;
  retentionScore: number;
  lastAssessed?: string;
  testPassed?: boolean;
  testPassedAt?: string;
};

export type AssessmentAttempt = {
  id: string;
  itemId: string;
  skillId: string;
  outcome: AssessmentOutcome;
  competency: Competency;
  source: AssessmentSource;
  selectedAnswer?: number|string;
  responseTimeMs?: number;
  revision: number;
  createdAt: string;
};

export type LessonProgress = {
  lessonId: string;
  completedStepIds: string[];
  stepTimeSec?: Record<string, number>;
  completed: boolean;
  checkpointScore?: number;
  updatedAt: string;
};

export type ReviewReason = 'scheduled'|'weakness'|'cumulative';
export type ReviewItem = {
  id: string;
  itemId: string;
  originalItemId?: string;
  skillId: string;
  stage: number;
  intervalHours: number;
  dueAt: string;
  lastOutcome: AssessmentOutcome;
  reason: ReviewReason;
};

export type StudySession = {
  id: string;
  skillId?: string;
  lessonId?: string;
  startedAt: string;
  endedAt: string;
  durationSec: number;
  mode: 'stopwatch'|'pomodoro';
  note?: string;
  aiUse?: AiUse;
};

export type ActiveTimer = {
  startedAt: string;
  skillId?: string;
  lessonId?: string;
  mode: 'stopwatch'|'pomodoro';
  workMinutes: number;
  breakMinutes: number;
  aiUse?: AiUse;
};

export type FeedbackContext = {
  attemptCount?: number;
  result?: AssessmentOutcome;
  timeSpentSec?: number;
  usedHint?: boolean;
};

export type ContentFeedback = {
  id: string;
  targetType: 'lesson'|'step'|'exercise'|'checkpoint'|'assessment'|'review-item';
  targetId: string;
  lessonId?: string;
  skillId: string;
  rating: 'good'|'bad'|null;
  category?: string;
  comment?: string;
  revision: number;
  context?: FeedbackContext;
  githubIssueUrl?: string;
  createdAt: string;
};

export type PracticalSubmission = {
  id: string;
  notes: string;
  mode: 'simulation' | 'physical';
  checks: string[];
  reviewer: string;
  updatedAt: string;
};

export type RetrievalOutcome = 'again' | 'explained' | 'fluent';
export type RetrievalAttempt = {
  id: string;
  cardId: string;
  revision: number;
  outcome: RetrievalOutcome;
  response: string;
  correction: string;
  elapsedSec: number;
  createdAt: string;
};
