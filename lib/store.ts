'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Evidence, SkillState } from './types';
import { defaultState, updateFromDiagnostic, updateFromEvidence } from './mastery';

interface MasteryStore {
  states: Record<string, SkillState>;
  evidence: Evidence[];
  diagnosticHistory: {questionId:string;correct:boolean;confidence:number;createdAt:string}[];
  answerDiagnostic: (skillId:string,questionId:string,correct:boolean,confidence:number)=>void;
  addEvidence: (evidence:Evidence)=>void;
  reset: ()=>void;
  importData: (data:any)=>void;
}

export const useMasteryStore = create<MasteryStore>()(persist((set,get)=>({
  states:{}, evidence:[], diagnosticHistory:[],
  answerDiagnostic:(skillId,questionId,correct,confidence)=>set(state=>{
    const current=state.states[skillId] ?? defaultState();
    const updated=updateFromDiagnostic(current,correct,confidence);
    const ev:Evidence={id:`diag-${questionId}-${Date.now()}`,skillId,kind:'diagnostic',title:`診断 ${questionId}`,detail:correct?'正答':'誤答',aiUse:'no-ai',strength:correct?3:1,createdAt:new Date().toISOString()};
    return {states:{...state.states,[skillId]:updated},evidence:[ev,...state.evidence],diagnosticHistory:[...state.diagnosticHistory,{questionId,correct,confidence,createdAt:new Date().toISOString()}]};
  }),
  addEvidence:(evidence)=>set(state=>{
    const current=state.states[evidence.skillId] ?? defaultState();
    return {states:{...state.states,[evidence.skillId]:updateFromEvidence(current,evidence)}, evidence:[evidence,...state.evidence]};
  }),
  reset:()=>set({states:{},evidence:[],diagnosticHistory:[]}),
  importData:(data)=>set({states:data.states??{},evidence:data.evidence??[],diagnosticHistory:data.diagnosticHistory??[]})
}),{name:'hanabi-study-v1'}));
