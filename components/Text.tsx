'use client';
import { type ReactNode } from 'react';
import { MathText } from './MathText';
import { translateText } from '@/lib/i18n';
import { useLanguageStore } from '@/lib/language-store';

/** Translate authored display text; objects and React elements retain their identity. */
export function Text({children,plain=false}:{children:ReactNode;plain?:boolean}){
  const language=useLanguageStore(s=>s.language);
  return typeof children==='string'?(plain?<>{translateText(children,language)}</>:<MathText>{children}</MathText>):<>{children}</>;
}
export const tr=(text:string)=>translateText(text,useLanguageStore.getState().language);
export const displayLocale=()=>useLanguageStore.getState().language==='en'?'en-US':'ja-JP';
export function useTranslation(){
  const language=useLanguageStore(s=>s.language);
  return (text:string)=>translateText(text,language);
}
