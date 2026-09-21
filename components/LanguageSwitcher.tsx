'use client';
import { useEffect } from 'react';
import { useLanguageStore } from '@/lib/language-store';

export function LanguageSwitcher(){
  const {language,setLanguage}=useLanguageStore();
  useEffect(()=>{void useLanguageStore.persist.rehydrate()},[]);
  useEffect(()=>{document.documentElement.lang=language},[language]);
  return <div className="mb-4 flex gap-1 rounded-lg border border-[#e1e4eb] p-1" role="group" aria-label="Language / 言語">
    {(['ja','en'] as const).map(code=><button key={code} type="button" lang={code} aria-pressed={language===code} onClick={()=>setLanguage(code)} className={`flex-1 rounded-md px-3 py-2 text-xs font-semibold ${language===code?'bg-[#e9edf5] text-[#0d1833]':'text-[#657083]'}`}>{code==='ja'?'日本語':'English'}</button>)}
  </div>;
}
