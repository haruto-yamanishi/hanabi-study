'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { applyPlacementCredit } from './placement';
import { validRetrievalAttempt } from './retrieval';
import { assessments } from '@/data/assessments';
import {
  ActiveTimer,
  AssessmentAttempt,
  AssessmentItem,
  AssessmentOutcome,
  ContentFeedback,
  Evidence,
  LessonProgress,
  PracticalSubmission,
  RetrievalAttempt,
  ReviewItem,
  SkillState,
  StudySession,
} from './types';
import { defaultState, updateFromAssessment, updateFromEvidence } from './mastery';

// 6h → 1d → 3d → 7d → 14d → 30d → 60d.
// It is intentionally a starting policy, not a literal “Ebbinghaus percentage” model.
const reviewIntervalsHours = [0, 6, 24, 72, 168, 336, 720, 1440];

type AssessmentMeta = { selectedAnswer?: number|string; responseTimeMs?: number };

interface MasteryStore {
  states: Record<string, SkillState>;
  retrievalAttempts: RetrievalAttempt[];
  recordRetrieval: (attempt: RetrievalAttempt) => void;
  practicalSubmissions: Record<string, PracticalSubmission>;
  savePractical: (submission: PracticalSubmission) => void;
  evidence: Evidence[];
  assessmentHistory: AssessmentAttempt[];
  lessonProgress: Record<string, LessonProgress>;
  reviewQueue: ReviewItem[];
  studySessions: StudySession[];
  activeTimer: ActiveTimer | null;
  feedback: ContentFeedback[];
  answerAssessment: (item: AssessmentItem, outcome: AssessmentOutcome, source: AssessmentAttempt['source'], meta?: AssessmentMeta) => void;
  completeLessonStep: (lessonId: string, stepId: string, timeSpentSec?: number) => void;
  completeLesson: (lessonId: string, checkpointScore?: number) => void;
  addEvidence: (evidence: Evidence) => void;
  submitFeedback: (feedback: ContentFeedback) => void;
  startTimer: (timer: ActiveTimer) => void;
  stopTimer: (note?: string) => void;
  reset: () => void;
  importData: (data: any) => void;
}

function dueAtFromStage(stage: number) {
  const hours = reviewIntervalsHours[Math.min(stage, reviewIntervalsHours.length - 1)];
  const d = new Date(Date.now() + hours * 60 * 60 * 1000);
  return d.toISOString();
}

function reviewVariantFor(item: AssessmentItem) {
  if (!item.variantGroup) return item;
  const variants = assessments.filter(a => a.variantGroup === item.variantGroup);
  if (variants.length < 2) return item;
  const index = variants.findIndex(a => a.id === item.id);
  return variants[(index + 1 + variants.length) % variants.length] ?? item;
}

export const useMasteryStore = create<MasteryStore>()(persist((set) => ({
  states: {},
  retrievalAttempts: [],
  recordRetrieval: attempt => set(state => {
    if (!validRetrievalAttempt(attempt) || state.retrievalAttempts.some(a=>a.id===attempt.id)) return {};
    return { retrievalAttempts: [...state.retrievalAttempts, attempt] };
  }),
  practicalSubmissions: {},
  savePractical: submission => set(state => ({ practicalSubmissions: { ...state.practicalSubmissions, [submission.id]: submission } })),
  evidence: [],
  assessmentHistory: [],
  lessonProgress: {},
  reviewQueue: [],
  studySessions: [],
  activeTimer: null,
  feedback: [],

  answerAssessment: (item, outcome, source, meta) => set(state => {
    const current = state.states[item.skillId] ?? defaultState();
    let updated = updateFromAssessment(current, outcome, item.competency, source);
    const attempt: AssessmentAttempt = {
      id: crypto.randomUUID(), itemId: item.id, skillId: item.skillId,
      outcome, competency: item.competency, source,
      selectedAnswer: meta?.selectedAnswer,
      responseTimeMs: meta?.responseTimeMs,
      revision: item.revision,
      createdAt: new Date().toISOString(),
    };

    if(source==='placement')updated=applyPlacementCredit(updated,attempt,state.assessmentHistory);

    const old = state.reviewQueue.find(r => r.itemId === item.id || r.originalItemId === item.id);
    let stage = old?.stage ?? 0;
    if (outcome === 'correct') stage = Math.min(stage + 1, reviewIntervalsHours.length - 1);
    else if (outcome === 'wrong') stage = Math.max(0, stage - 1);
    else stage = 0;

    const variant = reviewVariantFor(item);
    const intervalHours = reviewIntervalsHours[Math.min(stage, reviewIntervalsHours.length - 1)];
    const review: ReviewItem = {
      id: old?.id ?? crypto.randomUUID(),
      itemId: variant.id,
      originalItemId: old?.originalItemId ?? item.id,
      skillId: item.skillId,
      stage,
      intervalHours,
      dueAt: dueAtFromStage(stage),
      lastOutcome: outcome,
      reason: outcome === 'correct' ? (source === 'review' && stage >= 3 ? 'cumulative' : 'scheduled') : 'weakness',
    };

    const evidence: Evidence = {
      id: crypto.randomUUID(), skillId: item.skillId,
      kind: source === 'review' ? 'retention' : 'diagnostic',
      title: `${source === 'placement' ? '現在地テスト' : source === 'baseline' ? '診断' : source === 'checkpoint' ? 'Checkpoint' : '復習'}: ${item.id}`,
      detail: outcome === 'correct' ? '正答' : outcome === 'wrong' ? '誤答' : 'わからない',
      aiUse: 'no-ai', strength: outcome === 'correct' ? 3 : 1, createdAt: new Date().toISOString(),
    };

    return {
      states: { ...state.states, [item.skillId]: updated },
      assessmentHistory: [...state.assessmentHistory, attempt],
      reviewQueue: [...state.reviewQueue.filter(r => r.id !== old?.id && r.itemId !== item.id), review],
      evidence: [evidence, ...state.evidence],
    };
  }),

  completeLessonStep: (lessonId, stepId, timeSpentSec = 0) => set(state => {
    const current = state.lessonProgress[lessonId] ?? { lessonId, completedStepIds: [], stepTimeSec: {}, completed: false, updatedAt: new Date().toISOString() };
    const ids = current.completedStepIds.includes(stepId) ? current.completedStepIds : [...current.completedStepIds, stepId];
    const times = { ...(current.stepTimeSec ?? {}) };
    if (timeSpentSec > 0) times[stepId] = (times[stepId] ?? 0) + Math.round(timeSpentSec);
    return { lessonProgress: { ...state.lessonProgress, [lessonId]: { ...current, completedStepIds: ids, stepTimeSec: times, updatedAt: new Date().toISOString() } } };
  }),

  completeLesson: (lessonId, checkpointScore) => set(state => {
    const current = state.lessonProgress[lessonId] ?? { lessonId, completedStepIds: [], stepTimeSec: {}, completed: false, updatedAt: new Date().toISOString() };
    return { lessonProgress: { ...state.lessonProgress, [lessonId]: { ...current, completed: true, checkpointScore, updatedAt: new Date().toISOString() } } };
  }),

  addEvidence: evidence => set(state => {
    const current = state.states[evidence.skillId] ?? defaultState();
    return {
      states: { ...state.states, [evidence.skillId]: updateFromEvidence(current, evidence) },
      evidence: [evidence, ...state.evidence],
    };
  }),

  submitFeedback: feedback => set(state => ({ feedback: [feedback, ...state.feedback] })),

  startTimer: timer => set({ activeTimer: timer }),

  stopTimer: note => set(state => {
    if (!state.activeTimer) return {};
    const endedAt = new Date();
    const startedAt = new Date(state.activeTimer.startedAt);
    const elapsedSec = Math.max(1, Math.round((endedAt.getTime() - startedAt.getTime()) / 1000));
    let durationSec = elapsedSec;
    if (state.activeTimer.mode === 'pomodoro') {
      const workSec = Math.max(1, state.activeTimer.workMinutes * 60);
      const breakSec = Math.max(0, state.activeTimer.breakMinutes * 60);
      const cycleSec = workSec + breakSec;
      const fullCycles = Math.floor(elapsedSec / cycleSec);
      const remainder = elapsedSec % cycleSec;
      durationSec = fullCycles * workSec + Math.min(remainder, workSec);
    }
    const session: StudySession = {
      id: crypto.randomUUID(), skillId: state.activeTimer.skillId, lessonId: state.activeTimer.lessonId,
      startedAt: state.activeTimer.startedAt, endedAt: endedAt.toISOString(), durationSec,
      mode: state.activeTimer.mode, note, aiUse: state.activeTimer.aiUse,
    };
    return { activeTimer: null, studySessions: [session, ...state.studySessions] };
  }),

  reset: () => set({
    retrievalAttempts: [], practicalSubmissions: {}, states: {}, evidence: [], assessmentHistory: [], lessonProgress: {}, reviewQueue: [],
    studySessions: [], activeTimer: null, feedback: [],
  }),

  importData: data => set({
    retrievalAttempts: Array.isArray(data.retrievalAttempts) ? data.retrievalAttempts.filter(validRetrievalAttempt) : [],
    practicalSubmissions: data.practicalSubmissions ?? {},
    states: data.states ?? {},
    evidence: data.evidence ?? [],
    assessmentHistory: data.assessmentHistory?.map((h: any) => ({ revision: 1, ...h })) ?? data.diagnosticHistory?.map((h: any) => ({
      id: crypto.randomUUID(), itemId: h.questionId, skillId: h.skillId ?? '',
      outcome: h.correct ? 'correct' : 'wrong', competency: 'recall', source: 'baseline', revision: 1, createdAt: h.createdAt,
    })) ?? [],
    lessonProgress: data.lessonProgress ?? {},
    reviewQueue: data.reviewQueue?.map((r: any) => ({ intervalHours: 0, reason: r.lastOutcome === 'correct' ? 'scheduled' : 'weakness', ...r })) ?? [],
    studySessions: data.studySessions ?? [],
    activeTimer: data.activeTimer ?? null,
    feedback: data.feedback ?? [],
  }),
}), {
  name: 'hanabi-study-v2',
  partialize: state => state,
}));
