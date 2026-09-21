'use client';
import { Text, tr } from './Text';


import { useEffect, useMemo, useState } from 'react';
import { Clock3, Pause, Play } from 'lucide-react';
import { lessons } from '@/data/lessons';
import { skills } from '@/data/curriculum';
import { AiUse } from '@/lib/types';
import { useMasteryStore } from '@/lib/store';

function fmt(sec:number){ const m=Math.floor(sec/60); const s=sec%60; return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`; }
const aiLabels:Record<AiUse,string>={
  'no-ai':'No AI','hint-only':'Hint only','ai-explanation':'AI explanation','ai-debugging':'AI debugging','ai-generated':'AI generated'
};

export function StudyTimer(){
  const { activeTimer, startTimer, stopTimer, studySessions } = useMasteryStore();
  const [now,setNow]=useState(Date.now());
  const [skillId,setSkillId]=useState(skills[0].id);
  const [lessonId,setLessonId]=useState('');
  const [pomodoro,setPomodoro]=useState(false);
  const [work,setWork]=useState(25);
  const [rest,setRest]=useState(5);
  const [note,setNote]=useState('');
  const [aiUse,setAiUse]=useState<AiUse>('no-ai');

  useEffect(()=>{ if(!activeTimer)return; const id=setInterval(()=>setNow(Date.now()),1000); return()=>clearInterval(id); },[activeTimer]);
  const elapsed=activeTimer?Math.max(0,Math.floor((now-new Date(activeTimer.startedAt).getTime())/1000)):0;
  const phase=useMemo(()=>{
    if(!activeTimer || activeTimer.mode==='stopwatch') return {label:'学習中',remaining:null as number|null};
    const w=activeTimer.workMinutes*60,b=activeTimer.breakMinutes*60,cycle=Math.max(1,w+b),pos=elapsed%cycle;
    return pos<w?{label:'Focus',remaining:w-pos}:{label:'Break',remaining:cycle-pos};
  },[activeTimer,elapsed]);

  const today=new Date().toDateString();
  const todaySec=studySessions.filter(s=>new Date(s.startedAt).toDateString()===today).reduce((a,s)=>a+s.durationSec,0);
  const weekAgo=Date.now()-7*86400000;
  const weekSessions=studySessions.filter(s=>new Date(s.startedAt).getTime()>=weekAgo);
  const weekSec=weekSessions.reduce((a,s)=>a+s.durationSec,0);
  const bySkill=skills.map(skill=>({
    skill,
    sec:weekSessions.filter(s=>s.skillId===skill.id).reduce((a,s)=>a+s.durationSec,0),
  })).filter(x=>x.sec>0).sort((a,b)=>b.sec-a.sec).slice(0,6);

  const begin=()=>startTimer({
    startedAt:new Date().toISOString(), skillId, lessonId:lessonId||undefined,
    mode:pomodoro?'pomodoro':'stopwatch', workMinutes:work, breakMinutes:rest, aiUse,
  });
  const finish=()=>{stopTimer(note.trim()||undefined);setNote('')};

  return <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
    <section className="panel p-6 sm:p-8">
      <div className="kicker">Study timer</div>
      <div className="mt-5 text-center">
        <div className="text-sm font-bold text-[#657083]"><Text>{activeTimer?phase.label:'Ready'}</Text></div>
        <div className="metric mt-2 text-6xl font-bold tracking-tight text-[#0d1833]"><Text>{fmt(elapsed)}</Text></div>
        {phase.remaining!==null&&<div className="mt-2 text-sm text-[#714086]"><Text>{"このphase 残り "}</Text><Text>{fmt(phase.remaining)}</Text></div>}
      </div>

      {!activeTimer ? <div className="mt-8 space-y-3">
        <select value={skillId} onChange={e=>{setSkillId(e.target.value);setLessonId('')}} className="w-full rounded-xl border border-[#d9dde5] bg-white p-3 text-sm">
          {skills.map(s=><option key={s.id} value={s.id}><Text plain>{s.nameJa}</Text></option>)}
        </select>
        <select value={lessonId} onChange={e=>setLessonId(e.target.value)} className="w-full rounded-xl border border-[#d9dde5] bg-white p-3 text-sm">
          <option value="">{tr("Lesson指定なし")}</option>{lessons.filter(l=>l.skillId===skillId).map(l=><option key={l.id} value={l.id}><Text plain>{l.title}</Text></option>)}
        </select>
        <select value={aiUse} onChange={e=>setAiUse(e.target.value as AiUse)} className="w-full rounded-xl border border-[#d9dde5] bg-white p-3 text-sm">
          {Object.entries(aiLabels).map(([id,label])=><option key={id} value={id}><Text plain>{label}</Text></option>)}
        </select>
        <label className="flex items-center justify-between rounded-xl border border-[#d9dde5] p-3 text-sm font-semibold"><span>Pomodoro</span><input type="checkbox" checked={pomodoro} onChange={e=>setPomodoro(e.target.checked)}/></label>
        {pomodoro&&<div className="grid grid-cols-2 gap-3"><label className="text-xs text-[#657083]">Focus<input type="number" min={5} max={90} value={work} onChange={e=>setWork(+e.target.value)} className="mt-1 w-full rounded-xl border border-[#d9dde5] p-3 text-sm"/></label><label className="text-xs text-[#657083]">Break<input type="number" min={1} max={30} value={rest} onChange={e=>setRest(+e.target.value)} className="mt-1 w-full rounded-xl border border-[#d9dde5] p-3 text-sm"/></label></div>}
        <button onClick={begin} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0d1833] p-3 text-sm font-bold text-white"><Play size={17}/>Start</button>
      </div> : <div className="mt-8">
        <textarea value={note} onChange={e=>setNote(e.target.value)} rows={2} placeholder={tr("終了時メモ（任意）")} className="w-full resize-none rounded-xl border border-[#d9dde5] p-3 text-sm"/>
        <button onClick={finish} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#c83833] p-3 text-sm font-bold text-white"><Pause size={17}/>Stop & Record</button>
        <div className="mt-3 text-center text-xs text-[#747d8c]"><Text>{"進行中タイマーはlocalStorageに保存されるので、リロードしても復元されます。"}</Text></div>
      </div>}
    </section>

    <div className="space-y-5">
      <section className="panel p-5"><div className="flex items-center gap-2"><Clock3 size={18} className="text-[#0857a2]"/><div className="font-bold"><Text>{"学習時間"}</Text></div></div><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-xl bg-[#f8f9fb] p-4"><div className="kicker">Today</div><div className="metric mt-2 text-2xl font-bold"><Text>{Math.round(todaySec/60)}</Text><span className="ml-1 text-xs font-medium text-[#747d8c]">min</span></div></div><div className="rounded-xl bg-[#f8f9fb] p-4"><div className="kicker">7 days</div><div className="metric mt-2 text-2xl font-bold"><Text>{Math.round(weekSec/60)}</Text><span className="ml-1 text-xs font-medium text-[#747d8c]">min</span></div></div></div></section>
      <section className="panel p-5"><div className="kicker">By skill · 7 days</div><div className="mt-3 space-y-3">{bySkill.map(({skill,sec})=><div key={skill.id}><div className="flex justify-between text-xs"><span className="font-semibold"><Text>{skill.nameJa}</Text></span><span className="text-[#747d8c]"><Text>{Math.round(sec/60)}</Text> min</span></div><div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#e8ebf0]"><div className="h-full rounded-full bg-[#0857a2]" style={{width:`${Math.min(100,sec/Math.max(...bySkill.map(x=>x.sec),1)*100)}%`}}/></div></div>)}{!bySkill.length&&<div className="text-sm text-[#747d8c]"><Text>{"まだ学習記録がありません。"}</Text></div>}</div></section>
    </div>
  </div>;
}
