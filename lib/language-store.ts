'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'ja' | 'en';
export const useLanguageStore = create<{language:Language;setLanguage:(language:Language)=>void}>()(persist(
  set=>({language:'ja',setLanguage:language=>set({language})}),
  {name:'hanabi-study-language',skipHydration:true},
));
