'use client';

import { useEffect, useMemo, useState } from 'react';
import { Background, Controls, MarkerType, MiniMap, ReactFlow, type Edge, type Node } from '@xyflow/react';
import {
  BarChart3, BookOpen, ChevronRight, CircleDot, ClipboardCheck, Database, FileJson,
  GitBranch, Home, Layers3, MessageSquare, RefreshCcw, Route, Search, ShieldCheck,
  Sparkles, TimerReset, X
} from 'lucide-react';
import { assessments, baselineAssessments } from '@/data/assessments';
import { domainNames, kamiyamaSource, resources, roadmapStages, skills } from '@/data/curriculum';
import { lessons } from '@/data/lessons';
import { coverageForSkill, domainCoverage } from '@/lib/content';
import { defaultState, domainStats, foundationDebt, nextSkills, skillStatus } from '@/lib/mastery';
import { useMasteryStore } from '@/lib/store';
import { AiUse, AssessmentItem, AssessmentOutcome, ContentFeedback, Domain, Evidence as EvidenceType, SkillStatus } from '@/lib/types';
import { ProjectsScreen } from './ProjectsScreen';
import { LessonPlayer } from './LessonPlayer';
import { RadarChart } from './RadarChart';
import { StudyTimer } from './StudyTimer';

const nav = [
  ['home','ホーム',Home],['learn','学ぶ',BookOpen],['tests','テスト',ClipboardCheck],['status','ステータス',BarChart3],
  ['roadmap','ロードマップ',Route],['map','スキルマップ',GitBranch],['today','今日',TimerReset],['evidence','記録',ShieldCheck],
  ['projects','制作・修了',Layers3],['quality','品質',Sparkles],['settings','データ',Database],
] as const;
type Screen = typeof nav[number][0];

const statusLabel: Record<SkillStatus,string> = {'not-started':'未着手',learning:'学習中',mastered:'マスター'};
const statusClass: Record<SkillStatus,string> = {
  'not-started':'border-[#d9dde5] bg-[#f6f7f9] text-[#747d8c]',
  learning:'border-[#f0d39a] bg-[#fff4dc] text-[#8b5b08]',
  mastered:'border-[#c2e0cb] bg-[#e6f3ea] text-[#1e7c3c]',
};

function Panel({children,className=''}:{children:React.ReactNode;className?:string}){return <section className={`panel ${className}`}>{children}</section>}
function Bar({value}:{value:number}){return <div className="h-2 overflow-hidden rounded-full bg-[#e8ebf0]"><div className="h-full rounded-full bg-[#0857a2]" style={{width:`${Math.max(0,Math.min(100,value))}%`}}/></div>}
function Pill({status}:{status:SkillStatus}){return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusClass[status]}`}>{statusLabel[status]}</span>}

export default function MasteryOS(){
  const [screen,setScreen]=useState<Screen>('home');
  const [lessonId,setLessonId]=useState<string|null>(null);
  const {states,evidence,assessmentHistory,lessonProgress,reviewQueue}=useMasteryStore();
  const stats=useMemo(()=>domainStats(skills,states),[states]);
  const debts=useMemo(()=>foundationDebt(skills,states,evidence),[states,evidence]);
  const next=useMemo(()=>nextSkills(skills,states),[states]);
  const assessed=skills.filter(s=>{const active=lessons.some(l=>l.skillId===s.id&&((lessonProgress[l.id]?.completedStepIds.length??0)>0||lessonProgress[l.id]?.completed));return skillStatus(states[s.id]??defaultState(),active)!=='not-started'}).length;
  const due=reviewQueue.filter(r=>new Date(r.dueAt).getTime()<=Date.now()).length;

  if(screen==='learn'&&lessonId){
    const lesson=lessons.find(l=>l.id===lessonId);
    if(lesson)return <Shell screen={screen} setScreen={setScreen}><LessonPlayer key={lesson.id} lesson={lesson} onOpenLesson={setLessonId} onBack={()=>setLessonId(null)}/></Shell>;
  }

  return <Shell screen={screen} setScreen={setScreen} assessed={assessed}>
    {screen==='home'&&<HomeScreen stats={stats} next={next} assessed={assessed} attempts={assessmentHistory.length} due={due} setScreen={setScreen}/>} 
    {screen==='learn'&&<LearnScreen onOpen={setLessonId}/>} 
    {screen==='tests'&&<TestsScreen onOpenLesson={id=>{setLessonId(id);setScreen('learn')}}/>}
    {screen==='status'&&<StatusScreen stats={stats}/>} 
    {screen==='roadmap'&&<RoadmapScreen/>}
    {screen==='map'&&<SkillMap/>}
    {screen==='today'&&<TodayScreen/>}
    {screen==='evidence'&&<EvidenceScreen/>}
    {screen==='projects'&&<ProjectsScreen onOpenLesson={id=>{setLessonId(id);setScreen('learn')}}/>}
    {screen==='quality'&&<QualityScreen/>}
    {screen==='settings'&&<SettingsScreen/>}
  </Shell>;
}

function Shell({children,screen,setScreen,assessed=0}:{children:React.ReactNode;screen:Screen;setScreen:(s:Screen)=>void;assessed?:number}){
  return <div className="min-h-screen lg:grid lg:grid-cols-[252px_1fr]">
    <aside className="border-b border-[#e1e4eb] bg-white p-4 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
      <button onClick={()=>setScreen('home')} className="mb-7 flex w-full items-center gap-3 px-2 pt-2 text-left"><img src="/brand/FRCHanabi-Symbol-Mark.png" alt="Hanabi" className="h-12 w-12 object-contain"/><div><div className="text-[10px] font-bold uppercase tracking-[.16em] text-[#657083]">FRC Team 9494 Hanabi</div><div className="mt-0.5 text-base font-bold text-[#0d1833]">Hanabi Study</div></div></button>
      <div className="hanabi-spectrum mb-5" aria-hidden="true"><span/><span/><span/><span/><span/></div>
      <nav className="grid grid-cols-5 gap-1 sm:grid-cols-10 lg:grid-cols-1 lg:gap-1.5">{nav.map(([id,label,Icon])=><button key={id} onClick={()=>setScreen(id)} aria-label={label} title={label} className={`flex items-center justify-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition lg:justify-start lg:text-sm ${screen===id?'bg-[#e9edf5] text-[#0d1833]':'text-[#657083] hover:bg-[#f8f9fb]'}`}><Icon size={17}/><span className="hidden sm:inline">{label}</span></button>)}</nav>
      <div className="mt-8 hidden rounded-xl border border-[#e1e4eb] bg-[#f8f9fb] p-4 lg:block"><div className="kicker">Curriculum</div><div className="mt-2 flex items-baseline justify-between"><span className="text-sm font-bold">{assessed}/{skills.length}</span><span className="text-[11px] text-[#747d8c]">skills started</span></div><div className="mt-3"><Bar value={assessed/skills.length*100}/></div></div>
    </aside>
    <main className="min-w-0 p-4 sm:p-6 lg:p-8"><header className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><div className="kicker">HANABI STUDY</div><h1 className="mt-1 text-2xl font-bold tracking-tight">{nav.find(n=>n[0]===screen)?.[1]}</h1></div><div className="flex items-center gap-2 rounded-full border border-[#e1e4eb] bg-white px-3 py-2 text-xs font-semibold text-[#657083]"><CircleDot size={13} className="text-[#1e7c3c]"/>Local v0.3</div></header>{children}</main>
  </div>;
}

function HomeScreen({stats,next,assessed,attempts,due,setScreen}:{stats:ReturnType<typeof domainStats>;next:ReturnType<typeof nextSkills>;assessed:number;attempts:number;due:number;setScreen:(s:Screen)=>void}){
  const ready=next.filter(n=>n.ready);
  const completed=useMasteryStore(s=>Object.values(s.lessonProgress).filter(p=>p.completed).length);
  const cards=[
    {title:'学ぶ',detail:`${completed}/${lessons.length} lessons`,meta:`${skills.length} skills`,screen:'learn' as Screen,color:'#0857a2'},
    {title:'テスト',detail:`${attempts} attempts`,meta:`復習待ち ${due}`,screen:'tests' as Screen,color:'#c83833'},
    {title:'ステータス',detail:`${assessed}/${skills.length}`,meta:'8分野の達成度',screen:'status' as Screen,color:'#714086'},
    {title:'制作・修了',detail:'8つの統合制作',meta:'機械・電装・制御から引継ぎまで',screen:'projects' as Screen,color:'#1e7c3c'},
  ];
  return <div className="space-y-5">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(c=><button key={c.title} onClick={()=>setScreen(c.screen)} className="panel p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md"><div className="h-2 w-10 rounded-full" style={{background:c.color}}/><div className="mt-5 text-xs font-bold text-[#657083]">{c.title}</div><div className="mt-1 truncate text-xl font-bold">{c.detail}</div><div className="mt-2 text-xs text-[#747d8c]">{c.meta}</div></button>)}</div>
    <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
      <Panel className="p-5 sm:p-6"><div className="flex items-center justify-between"><div><div className="kicker">Domains</div><h2 className="mt-1 font-bold">現在地</h2></div><button onClick={()=>setScreen('status')} className="text-xs font-bold text-[#0857a2]">詳細</button></div><div className="mt-4"><RadarChart labels={stats.map(s=>domainNames[s.domain as Domain])} values={stats.map(s=>s.score)} size={330}/></div></Panel>
      <Panel className="p-5 sm:p-6"><div className="kicker">Next</div><h2 className="mt-1 font-bold">次に進めるSkill</h2><div className="mt-4 space-y-3">{ready.slice(0,7).map(n=><div key={n.skill.id} className="flex items-center gap-3 rounded-xl border border-[#e1e4eb] p-3"><span className="h-2.5 w-2.5 rounded-full bg-[#1e7c3c]"/><div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold">{n.skill.nameJa}</div><div className="mt-1 text-xs text-[#747d8c]">{domainNames[n.skill.domain]} · {n.skill.section}</div></div><ChevronRight size={15} className="text-[#a1a8b3]"/></div>)}</div></Panel>
    </div>
  </div>;
}

function LearnScreen({onOpen}:{onOpen:(id:string)=>void}){
  const {lessonProgress}=useMasteryStore();
  const [query,setQuery]=useState('');
  const [domain,setDomain]=useState<'all'|Domain>('all');
  const list=lessons.filter(l=>{const s=skills.find(x=>x.id===l.skillId)!;return(domain==='all'||s.domain===domain)&&(`${l.title} ${l.summary} ${s.nameJa}`.toLowerCase().includes(query.toLowerCase()))});
  return <div className="grid gap-5 xl:grid-cols-[1fr_310px]">
    <div><div className="mb-4 flex flex-col gap-3 sm:flex-row"><div className="flex flex-1 items-center gap-2 rounded-xl border border-[#d9dde5] bg-white px-4"><Search size={16} className="text-[#747d8c]"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Lessonを検索" className="w-full bg-transparent py-3 text-sm outline-none"/></div><select value={domain} onChange={e=>setDomain(e.target.value as any)} className="rounded-xl border border-[#d9dde5] bg-white px-3 text-sm"><option value="all">全分野</option>{Object.entries(domainNames).map(([id,n])=><option key={id} value={id}>{n}</option>)}</select></div>
      {list.length===0&&<p className="panel p-5 text-sm text-[#657083]">一致する教材がありません。検索語や分野を変えてください。</p>}
      <div className="grid gap-4 md:grid-cols-2">{list.map(l=>{const s=skills.find(x=>x.id===l.skillId)!;const p=lessonProgress[l.id];const done=p?.completedStepIds.length??0;return <button key={l.id} onClick={()=>onOpen(l.id)} className="panel p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-start justify-between gap-3"><div><div className="kicker">{domainNames[s.domain]} · {s.section}</div><h3 className="mt-2 font-bold leading-6">{l.title}</h3></div>{p?.completed&&<span className="rounded-full border border-[#bfd3e5] bg-[#e6eff7] px-2.5 py-1 text-[10px] font-bold text-[#0857a2]">Lesson完了</span>}</div><p className="mt-3 text-sm leading-6 text-[#657083]">{l.summary}</p><div className="mt-4"><Bar value={p?.completed?100:done/l.steps.length*75}/></div><div className="mt-3 flex flex-wrap gap-2 text-[10px] text-[#747d8c]"><span>{l.practical ? '基幹教材・実習付き' : '短編入門'}</span><span>{l.estimatedMinutes} min</span><span>rev.{l.revision}</span>{s.schoolMappings?.slice(0,1).map(m=><span key={m.courseName} className="rounded-full bg-[#f0f1f4] px-2 py-1">神山: {m.courseName}</span>)}</div></button>})}</div>
    </div>
    <div className="space-y-5"><Panel className="p-5"><div className="kicker">In-app content</div><div className="metric mt-2 text-4xl font-bold">{lessons.length}</div><p className="mt-2 text-sm leading-6 text-[#657083]">全78スキルに基幹教材と実習。短編入門は導入用です。制作・修了画面で8つの統合課題と提出条件を確認できます。</p></Panel><Panel className="p-5"><div className="kicker">External references</div><div className="mt-3 space-y-2">{resources.map(r=><a key={r.id} href={r.url} target="_blank" rel="noreferrer" className="block rounded-xl border border-[#e1e4eb] p-3 text-xs font-semibold text-[#0857a2]">{r.provider} · {r.title}</a>)}</div></Panel></div>
  </div>;
}

function nextBaseline(history:ReturnType<typeof useMasteryStore.getState>['assessmentHistory']){
  const attempted=new Set(history.filter(h=>h.source==='baseline').map(h=>h.itemId));
  const unanswered=baselineAssessments.filter(a=>!attempted.has(a.id));
  if(!unanswered.length)return null;
  const last=[...history].reverse().find(h=>h.source==='baseline');
  if(last&&last.outcome!=='correct'){
    const lastSkill=skills.find(s=>s.id===last.skillId);
    const prereq=new Set(lastSkill?.prerequisites??[]);
    const branch=unanswered.find(q=>prereq.has(q.skillId));
    if(branch)return branch;
  }
  return unanswered[0];
}

function TestsScreen({onOpenLesson}:{onOpenLesson:(id:string)=>void}){
  const {assessmentHistory,answerAssessment,states}=useMasteryStore();
  const item=nextBaseline(assessmentHistory);
  const done=assessmentHistory.filter(h=>h.source==='baseline').length;
  const [choice,setChoice]=useState<number|null>(null);
  const [numeric,setNumeric]=useState('');
  const [startedAt,setStartedAt]=useState(Date.now());

  useEffect(()=>{setChoice(null);setNumeric('');setStartedAt(Date.now())},[item?.id]);
  const submit=(outcome?:AssessmentOutcome)=>{
    if(!item)return;
    let o=outcome;
    const selected=item.format==='mcq'?(choice??undefined):(numeric.trim()||undefined);
    if(!o){
      if(item.format==='mcq')o=choice===item.answer?'correct':'wrong';
      else{const n=Number(numeric),t=Number(item.answer);o=Number.isFinite(n)&&Math.abs(n-t)<=(item.tolerance??0)?'correct':'wrong'}
    }
    answerAssessment(item,o!,'baseline',{selectedAnswer:selected,responseTimeMs:Date.now()-startedAt});
  };
  useEffect(()=>{
    if(!item)return;
    const fn=(e:KeyboardEvent)=>{
      if((e.target as HTMLElement)?.tagName==='INPUT')return;
      const key=e.key.toLowerCase();
      if(item.format==='mcq'){
        const map:Record<string,number>={a:0,b:1,c:2,d:3,'1':0,'2':1,'3':2,'4':3};
        if(key in map && (item.options?.length??0)>map[key]) setChoice(map[key]);
      }
      if(key==='s'){e.preventDefault();submit('skipped')}
      if(key==='enter'&&(item.format==='mcq'?choice!==null:!!numeric.trim())){e.preventDefault();submit()}
    };
    window.addEventListener('keydown',fn);return()=>window.removeEventListener('keydown',fn);
  },[item?.id,choice,numeric,startedAt]);

  const recent=[...assessmentHistory].reverse().filter(h=>h.source==='baseline').slice(0,8);
  if(!item){
    const rows=skills.map(skill=>{
      const attempts=assessmentHistory.filter(h=>h.skillId===skill.id&&h.source==='baseline');
      if(!attempts.length)return null;
      const correct=attempts.filter(a=>a.outcome==='correct').length;
      const skipped=attempts.filter(a=>a.outcome==='skipped').length;const wrong=attempts.filter(a=>a.outcome==='wrong').length;
      return {skill,attempts,correct,skipped,wrong,state:states[skill.id]??defaultState()};
    }).filter(Boolean) as {skill:typeof skills[number];attempts:any[];correct:number;skipped:number;wrong:number;state:ReturnType<typeof defaultState>}[];
    const recommendations=rows.filter(r=>r.state.score<45||r.skipped>0).map(r=>({r,lesson:lessons.find(l=>l.skillId===r.skill.id)})).filter(x=>x.lesson).slice(0,8);
    return <div className="space-y-5">
      <Panel className="p-7"><div className="kicker">Baseline complete</div><h2 className="mt-2 text-2xl font-bold">Skillごとの現在地</h2><p className="mt-2 text-sm text-[#657083]">BaselineだけではMasterになりません。Checkpointと時間を空けたReviewを重ねて判定します。</p></Panel>
      <Panel className="p-5"><div className="kicker">Results by skill</div><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{rows.map(r=><div key={r.skill.id} className="rounded-xl border border-[#e1e4eb] p-4"><div className="flex items-start justify-between gap-2"><div><div className="text-sm font-bold">{r.skill.nameJa}</div><div className="mt-1 text-[11px] text-[#747d8c]">correct {r.correct} · wrong {r.wrong} · skip {r.skipped}</div></div><Pill status={skillStatus(r.state)}/></div><div className="mt-3"><Bar value={r.state.score}/></div></div>)}</div></Panel>
      <Panel className="p-5"><div className="kicker">Attempt history</div><div className="mt-3 grid gap-2 sm:grid-cols-2">{[...assessmentHistory].reverse().filter(a=>a.source==='baseline').slice(0,16).map(a=><div key={a.id} className="flex items-center justify-between rounded-xl border border-[#e1e4eb] p-3 text-xs"><span>{skills.find(s=>s.id===a.skillId)?.nameJa}</span><span className={a.outcome==='correct'?'text-[#1e7c3c]':a.outcome==='wrong'?'text-[#c83833]':'text-[#8b5b08]'}>{a.outcome}</span></div>)}</div></Panel>
      <Panel className="p-5"><div className="kicker">Recommended next lessons</div><div className="mt-3 grid gap-2 sm:grid-cols-2">{recommendations.map(({r,lesson})=><button key={r.skill.id} onClick={()=>onOpenLesson(lesson!.id)} className="rounded-xl border border-[#e1e4eb] p-3 text-left"><div className="text-sm font-bold">{r.skill.nameJa}</div><div className="mt-1 text-xs text-[#0857a2]">{lesson!.title} →</div></button>)}</div></Panel>
    </div>;
  }
  const skill=skills.find(s=>s.id===item.skillId)!;
  return <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
    <Panel className="p-6 sm:p-8"><div className="flex items-center justify-between"><div><div className="kicker">Adaptive baseline · {done+1}/{baselineAssessments.length}</div><div className="mt-2 text-sm font-semibold text-[#657083]">{skill.nameJa} · {item.competency}</div></div><div className="text-3xl font-bold text-[#e1e4eb]">L{item.difficulty}</div></div><h2 className="mt-8 max-w-3xl text-xl font-bold leading-8">{item.prompt}</h2>{item.format==='mcq'?<div className="mt-6 grid gap-3">{item.options?.map((o,i)=><button key={o} onClick={()=>setChoice(i)} className={`rounded-xl border p-4 text-left text-sm ${choice===i?'border-[#0857a2] bg-[#e6eff7]':'border-[#e1e4eb] hover:bg-[#f8f9fb]'}`}>{String.fromCharCode(65+i)}. {o}</button>)}</div>:<input value={numeric} onChange={e=>setNumeric(e.target.value)} inputMode="decimal" placeholder="数値を入力" className="mt-6 w-full rounded-xl border border-[#d9dde5] p-4 outline-none focus:border-[#0857a2]"/>}<div className="mt-7 grid gap-2 sm:grid-cols-2"><button onClick={()=>submit('skipped')} className="rounded-xl border border-[#d9dde5] p-3 text-sm font-bold text-[#657083]">わからない / スキップ</button><button onClick={()=>submit()} disabled={item.format==='mcq'?choice===null:!numeric.trim()} className="rounded-xl bg-[#0d1833] p-3 text-sm font-bold text-white disabled:opacity-30">回答する</button></div><div className="mt-3 text-center text-[10px] text-[#a1a8b3]">A–D / 1–4: 選択 · Enter: 回答 · S: スキップ</div></Panel>
    <div className="space-y-5"><Panel className="p-5"><div className="kicker">Assessment design</div><div className="mt-4 space-y-3 text-sm leading-6 text-[#657083]"><p>正答・誤答・skipを別々に保存。</p><p>Recall / Calculate / Transfer / Debug / Designを区別。</p><p>誤答時は前提Skillへadaptiveに戻る。</p><p>Reviewでは同じvariant groupの別問題を優先。</p></div></Panel><Panel className="p-5"><div className="kicker">Recent</div><div className="mt-3 space-y-2">{recent.map(a=><div key={a.id} className="flex items-center justify-between rounded-lg border border-[#e1e4eb] px-3 py-2 text-xs"><span className="truncate">{skills.find(s=>s.id===a.skillId)?.nameJa}</span><span className={a.outcome==='correct'?'text-[#1e7c3c]':a.outcome==='wrong'?'text-[#c83833]':'text-[#8b5b08]'}>{a.outcome}</span></div>)}</div></Panel></div>
  </div>;
}

function StatusScreen({stats}:{stats:ReturnType<typeof domainStats>}){
  const {states,lessonProgress,studySessions}=useMasteryStore();
  const [selected,setSelected]=useState(0);
  const selectedStat=stats[selected]??stats[0];
  const domain=selectedStat.domain as Domain;
  const domainSkills=skills.filter(s=>s.domain===domain);
  const hasActivity=(skillId:string)=>lessons.some(l=>l.skillId===skillId&&((lessonProgress[l.id]?.completedStepIds.length??0)>0||lessonProgress[l.id]?.completed));
  const mastered=domainSkills.filter(s=>skillStatus(states[s.id]??defaultState(),hasActivity(s.id))==='mastered');
  const learning=domainSkills.filter(s=>skillStatus(states[s.id]??defaultState(),hasActivity(s.id))==='learning');
  const next=nextSkills(skills,states).filter(n=>n.skill.domain===domain&&n.ready).slice(0,5);
  const weak=domainSkills.filter(s=>skillStatus(states[s.id]??defaultState(),hasActivity(s.id))!=='mastered').sort((a,b)=>(states[a.id]?.score??0)-(states[b.id]?.score??0)).slice(0,5);
  const weekAgo=Date.now()-7*86400000;
  const studyMin=Math.round(studySessions.filter(s=>s.skillId&&domainSkills.some(k=>k.id===s.skillId)&&new Date(s.startedAt).getTime()>=weekAgo).reduce((a,s)=>a+s.durationSec,0)/60);
  return <div className="space-y-5">
    <div className="grid gap-5 xl:grid-cols-[1fr_1fr]"><Panel className="p-5 sm:p-6"><div className="kicker">Domain achievement</div><h2 className="mt-1 font-bold">分野別達成度</h2><RadarChart labels={stats.map(s=>domainNames[s.domain as Domain])} values={stats.map(s=>s.score)} size={390} selectedIndex={selected} onSelect={setSelected}/><p className="mt-2 text-center text-xs text-[#747d8c]">軸をクリックすると分野詳細を切り替えます。Assessment / Retention / Evidenceを重く反映。</p></Panel>
      <Panel className="p-5 sm:p-6"><div className="flex items-start justify-between"><div><div className="kicker">{domainNames[domain]}</div><h2 className="mt-1 text-xl font-bold">{Math.round(selectedStat.score)} / 100</h2></div><div className="text-right text-xs text-[#747d8c]">Retention {Math.round(selectedStat.retention)}<br/>7 days {studyMin} min</div></div><div className="mt-4"><Bar value={selectedStat.score}/></div><div className="mt-5 grid grid-cols-3 gap-2"><div className="rounded-xl bg-[#f8f9fb] p-3"><div className="text-[10px] text-[#747d8c]">Master</div><div className="metric mt-1 text-xl font-bold">{mastered.length}</div></div><div className="rounded-xl bg-[#f8f9fb] p-3"><div className="text-[10px] text-[#747d8c]">Learning</div><div className="metric mt-1 text-xl font-bold">{learning.length}</div></div><div className="rounded-xl bg-[#f8f9fb] p-3"><div className="text-[10px] text-[#747d8c]">Total</div><div className="metric mt-1 text-xl font-bold">{domainSkills.length}</div></div></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><div><div className="kicker">Next</div><div className="mt-2 space-y-2">{next.map(n=><div key={n.skill.id} className="rounded-lg border border-[#e1e4eb] p-2 text-xs font-semibold">{n.skill.nameJa}</div>)}</div></div><div><div className="kicker">Weakness</div><div className="mt-2 space-y-2">{weak.map(s=><div key={s.id} className="flex justify-between rounded-lg border border-[#e1e4eb] p-2 text-xs"><span>{s.nameJa}</span><span>{Math.round(states[s.id]?.score??0)}</span></div>)}</div></div></div></Panel></div>
    <Panel className="p-5"><div className="kicker">{domainNames[domain]} skills</div><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{domainSkills.map(s=>{const st=states[s.id]??defaultState();const status=skillStatus(st,hasActivity(s.id));return <div key={s.id} className="rounded-xl border border-[#e1e4eb] p-4"><div className="flex items-start justify-between gap-2"><div><div className="text-sm font-bold">{s.nameJa}</div><div className="mt-1 text-[11px] text-[#747d8c]">{s.section}</div></div><Pill status={status}/></div><div className="mt-3"><Bar value={st.score}/></div><div className="mt-2 text-[10px] text-[#747d8c]">score {Math.round(st.score)} · retention {Math.round(st.retentionScore)}</div></div>})}</div></Panel>
  </div>;
}

function RoadmapScreen(){
  const {states,lessonProgress}=useMasteryStore();
  const hasActivity=(skillId:string)=>lessons.some(l=>l.skillId===skillId&&((lessonProgress[l.id]?.completedStepIds.length??0)>0||lessonProgress[l.id]?.completed));
  const sectionState=(section:string)=>{
    const set=skills.filter(s=>s.section===section);
    const avg=set.reduce((a,s)=>a+(states[s.id]?.score??0),0)/(set.length||1);
    const missingIds=Array.from(new Set(set.flatMap(s=>s.prerequisites.filter(p=>(states[p]?.score??0)<55))));
    const started=set.some(s=>skillStatus(states[s.id]??defaultState(),hasActivity(s.id))!=='not-started');
    const status:SkillStatus=avg>=82?'mastered':started?'learning':'not-started';
    return {avg,status,set,missing:missingIds.map(id=>skills.find(s=>s.id===id)).filter(Boolean)};
  };
  const sectionEntries=roadmapStages.flatMap(stage=>stage.sections.map(section=>({stage,section,state:sectionState(section)})));
  const currentKey=sectionEntries.find(x=>x.state.status!=='mastered'&&x.state.missing.length===0)?.section;
  return <div className="space-y-5">
    <Panel className="p-5"><div className="kicker">Connected roadmap</div><p className="mt-2 text-sm text-[#657083]">基礎 → Engineering Core → FRC Core → Robotics → Advanced。モバイルでは縦、デスクトップでは横につながります。</p></Panel>
    <div className="flex flex-col gap-3 lg:flex-row lg:items-start">{roadmapStages.map((stage,idx)=><div key={stage.id} className="contents"><div className="min-w-0 flex-1 space-y-3"><div className="px-2"><div className="text-xs font-bold text-[#0857a2]">{idx+1}. {stage.title}</div><div className="mt-1 text-xs text-[#747d8c]">{stage.subtitle}</div></div>{stage.sections.map(section=>{const st=sectionState(section);const current=currentKey===section;return <div key={section} className={`rounded-2xl border bg-white p-4 shadow-sm ${current?'border-[#0857a2] ring-2 ring-[#0857a2]/10':'border-[#e1e4eb]'}`}><div className="flex items-center justify-between gap-2"><div className="text-sm font-bold">{section}</div><div className="flex items-center gap-2">{current&&<span className="rounded-full bg-[#e6eff7] px-2 py-1 text-[9px] font-bold text-[#0857a2]">現在地</span>}<Pill status={st.status}/></div></div><div className="mt-3"><Bar value={st.avg}/></div><div className="mt-2 text-[10px] text-[#747d8c]">{st.set.length} skills · {Math.round(st.avg)}%</div><div className="mt-3 space-y-1">{st.set.slice(0,4).map(s=><div key={s.id} className="truncate text-[11px] text-[#657083]">• {s.nameJa}</div>)}{st.set.length>4&&<div className="text-[10px] text-[#a1a8b3]">+{st.set.length-4}</div>}</div>{st.missing.length>0&&<div className="mt-3 rounded-lg bg-[#fff4dc] p-2 text-[10px] leading-4 text-[#8b5b08]">前提: {st.missing.slice(0,4).map(x=>x!.nameJa).join(' / ')}{st.missing.length>4?' …':''}</div>}</div>})}</div>{idx<roadmapStages.length-1&&<div className="flex items-center justify-center text-2xl text-[#c8ced9] lg:h-24 lg:w-8"><span className="lg:hidden">↓</span><span className="hidden lg:inline">→</span></div>}</div>)}</div>
    <KamiyamaPanel/>
  </div>;
}

function KamiyamaPanel(){
  const [relation,setRelation]=useState('all');
  const mapped=skills.filter(s=>s.schoolMappings?.length).length;
  const rows=skills.flatMap(s=>(s.schoolMappings??[]).map(m=>({skill:s,m}))).filter(x=>relation==='all'||x.m.relation===relation);
  return <Panel className="p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="kicker">Kamiyama mapping · {kamiyamaSource.year}</div><h2 className="mt-1 font-bold">神山の授業との対応</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-[#657083]">{mapped}/{skills.length} Skillに学校科目mappingあり。履修済みでも自動Masterにはしません。mappingは年度付きで保持し、学校固有情報とMasteryを分離しています。</p></div><div className="flex gap-2"><a href={kamiyamaSource.curriculumUrl} target="_blank" rel="noreferrer" className="rounded-xl border border-[#d9dde5] px-3 py-2 text-xs font-bold text-[#0857a2]">公式Curriculum</a><a href={kamiyamaSource.syllabusUrl} target="_blank" rel="noreferrer" className="rounded-xl border border-[#d9dde5] px-3 py-2 text-xs font-bold text-[#0857a2]">授業一覧</a></div></div><div className="mt-4 flex flex-wrap gap-2">{['all','direct','partial','prerequisite','extension','gap'].map(r=><button key={r} onClick={()=>setRelation(r)} className={`rounded-full border px-3 py-1.5 text-[10px] font-bold ${relation===r?'border-[#0857a2] bg-[#e6eff7] text-[#0857a2]':'border-[#d9dde5] text-[#657083]'}`}>{r}</button>)}</div><div className="mt-5 grid max-h-[420px] gap-3 overflow-auto md:grid-cols-2 xl:grid-cols-3">{rows.map(({skill,m},i)=><div key={`${skill.id}-${m.courseName}-${i}`} className="rounded-xl border border-[#e1e4eb] p-3"><div className="flex items-start justify-between gap-2"><div className="text-sm font-bold">{skill.nameJa}</div><span className="rounded-full bg-[#f0f1f4] px-2 py-1 text-[9px] font-bold">{m.relation}</span></div><div className="mt-2 text-xs text-[#657083]">{m.courseName}{m.grade?` · ${m.grade}年`:''}</div><div className="mt-1 text-[10px] text-[#a1a8b3]">source {m.sourceYear}</div></div>)}</div></Panel>;
}

function SkillMap(){
  const {states,lessonProgress}=useMasteryStore();const[selected,setSelected]=useState<string|null>(null);
  const hasActivity=(skillId:string)=>lessons.some(l=>l.skillId===skillId&&((lessonProgress[l.id]?.completedStepIds.length??0)>0||lessonProgress[l.id]?.completed));
  const nodes:Node[]=skills.map(s=>{const st=states[s.id]??defaultState();return{id:s.id,position:{x:s.x,y:s.y},data:{label:<div className="min-w-[125px]"><div className="text-[9px] font-bold uppercase tracking-wider text-[#747d8c]">{domainNames[s.domain]}</div><div className="mt-1 text-xs font-bold">{s.nameJa}</div><div className="mt-2"><Pill status={skillStatus(st,hasActivity(s.id))}/></div></div>},style:{background:'#fff',border:selected===s.id?'2px solid #0857a2':'1px solid #d9dde5',borderRadius:10,padding:10,width:160}}});
  const edges:Edge[]=skills.flatMap(s=>s.prerequisites.map(p=>({id:`${p}-${s.id}`,source:p,target:s.id,markerEnd:{type:MarkerType.ArrowClosed},style:{stroke:'#c8ced9',strokeWidth:1}})));
  const sk=skills.find(s=>s.id===selected);const st=sk?(states[sk.id]??defaultState()):null;
  return <div className="relative h-[calc(100vh-145px)] min-h-[650px] overflow-hidden rounded-2xl border border-[#e1e4eb] bg-white"><ReactFlow nodes={nodes} edges={edges} fitView minZoom={.15} maxZoom={1.8} onNodeClick={(_,n)=>setSelected(n.id)}><Background gap={26} size={1} color="#e5e7eb"/><Controls/><MiniMap pannable zoomable nodeColor="#dbe4ef" maskColor="rgba(245,246,249,.74)"/></ReactFlow>{sk&&st&&<div className="absolute right-4 top-4 z-10 w-[min(410px,calc(100%-32px))] rounded-2xl border border-[#d9dde5] bg-white/95 p-5 shadow-xl backdrop-blur"><button onClick={()=>setSelected(null)} className="absolute right-3 top-3 text-[#747d8c]"><X size={17}/></button><div className="kicker">{domainNames[sk.domain]} · {sk.section}</div><h3 className="mt-1 text-lg font-bold">{sk.nameJa}</h3><p className="mt-3 text-sm leading-6 text-[#657083]">{sk.description}</p><div className="mt-4 flex items-center justify-between"><Pill status={skillStatus(st,hasActivity(sk.id))}/><span className="metric text-sm text-[#657083]">{Math.round(st.score)}%</span></div><div className="mt-3"><Bar value={st.score}/></div><div className="mt-5 text-xs font-bold text-[#657083]">FRC</div><div className="mt-2 flex flex-wrap gap-2">{sk.frcApplications.map(a=><span key={a} className="rounded-lg bg-[#f8f9fb] px-2 py-1 text-xs">{a}</span>)}</div>{sk.schoolMappings?.length?<><div className="mt-5 text-xs font-bold text-[#657083]">神山 2026</div><div className="mt-2 space-y-1">{sk.schoolMappings.map(m=><div key={`${m.courseName}-${m.relation}`} className="text-xs text-[#657083]">{m.courseName} · {m.relation}</div>)}</div></>:null}</div>}</div>;
}

function TodayScreen(){return <div className="space-y-5"><StudyTimer/><ReviewQueue/></div>}

function ReviewQueue(){
  const {reviewQueue,answerAssessment,assessmentHistory}=useMasteryStore();
  const now=Date.now();
  const due=reviewQueue.filter(r=>new Date(r.dueAt).getTime()<=now).sort((a,b)=>a.dueAt.localeCompare(b.dueAt));
  const weakness=reviewQueue.filter(r=>r.lastOutcome!=='correct').sort((a,b)=>a.dueAt.localeCompare(b.dueAt));
  const cumulative=reviewQueue.filter(r=>r.stage>=3&&r.lastOutcome==='correct').sort((a,b)=>a.dueAt.localeCompare(b.dueAt));
  const [mode,setMode]=useState<'due'|'weakness'|'cumulative'>('due');
  const list=mode==='weakness'?weakness:mode==='cumulative'?cumulative:due;
  const r=list[0]; const item=r?assessments.find(a=>a.id===r.itemId):null;
  const [choice,setChoice]=useState<number|null>(null);const[numeric,setNumeric]=useState('');const[startedAt,setStartedAt]=useState(Date.now());
  useEffect(()=>{setChoice(null);setNumeric('');setStartedAt(Date.now())},[item?.id,mode]);
  const submit=(outcome?:AssessmentOutcome)=>{if(!item)return;let o=outcome;const selected=item.format==='mcq'?(choice??undefined):(numeric.trim()||undefined);if(!o){if(item.format==='mcq')o=choice===item.answer?'correct':'wrong';else{const n=Number(numeric),t=Number(item.answer);o=Number.isFinite(n)&&Math.abs(n-t)<=(item.tolerance??0)?'correct':'wrong'}}answerAssessment(item,o!,'review',{selectedAnswer:selected,responseTimeMs:Date.now()-startedAt})};
  const recallCount=assessmentHistory.filter(a=>a.source==='review').length;
  return <Panel className="p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="kicker">Spaced repetition</div><h2 className="mt-1 font-bold">復習キュー</h2><div className="mt-1 text-xs text-[#747d8c]">review attempts {recallCount}</div></div><div className="flex gap-2">{([['due',due.length,'Due'],['weakness',weakness.length,'Weakness'],['cumulative',cumulative.length,'Cumulative']] as const).map(([id,count,label])=><button key={id} onClick={()=>setMode(id)} className={`rounded-xl border px-3 py-2 text-xs font-bold ${mode===id?'border-[#714086] bg-[#f3ecf6] text-[#714086]':'border-[#d9dde5] text-[#657083]'}`}>{label} {count}</button>)}</div></div>{!item?<div className="mt-5 rounded-xl border border-dashed border-[#d9dde5] p-6 text-sm text-[#747d8c]">このキューに問題はありません。</div>:<div className="mt-5 rounded-2xl border border-[#e1e4eb] p-5"><div className="flex justify-between text-xs font-bold text-[#714086]"><span>Stage {r.stage} · {item.competency}</span><span>{r.intervalHours<24?`${r.intervalHours}h`:`${Math.round(r.intervalHours/24)}d`} interval</span></div><div className="mt-3 font-bold leading-7">{item.prompt}</div>{item.format==='mcq'?<div className="mt-4 grid gap-2">{item.options?.map((o,i)=><button key={o} onClick={()=>setChoice(i)} className={`rounded-xl border p-3 text-left text-sm ${choice===i?'border-[#0857a2] bg-[#e6eff7]':'border-[#d9dde5]'}`}>{o}</button>)}</div>:<input value={numeric} onChange={e=>setNumeric(e.target.value)} className="mt-4 w-full rounded-xl border border-[#d9dde5] p-3" placeholder="数値を入力"/>}<div className="mt-4 grid gap-2 sm:grid-cols-2"><button onClick={()=>submit('skipped')} className="rounded-xl border border-[#d9dde5] p-3 text-sm font-bold text-[#657083]">思い出せない</button><button onClick={()=>submit()} disabled={item.format==='mcq'?choice===null:!numeric.trim()} className="rounded-xl bg-[#0d1833] p-3 text-sm font-bold text-white disabled:opacity-30">回答</button></div></div>}</Panel>;
}

function EvidenceScreen(){
  const {evidence,addEvidence,studySessions}=useMasteryStore();const[skillId,setSkillId]=useState(skills[0].id);const[kind,setKind]=useState<EvidenceType['kind']>('implementation');const[aiUse,setAiUse]=useState<AiUse>('no-ai');const[title,setTitle]=useState('');const[detail,setDetail]=useState('');
  const save=()=>{if(!title.trim())return;addEvidence({id:crypto.randomUUID(),skillId,kind,title:title.trim(),detail:detail.trim(),aiUse,strength:3,createdAt:new Date().toISOString()});setTitle('');setDetail('')};
  return <div className="grid gap-5 xl:grid-cols-[390px_1fr]"><Panel className="p-5"><div className="kicker">Evidence</div><h2 className="mt-1 font-bold">成果を記録</h2><div className="mt-5 space-y-3"><Select value={skillId} onChange={setSkillId}>{skills.map(s=><option key={s.id} value={s.id}>{s.nameJa}</option>)}</Select><Select value={kind} onChange={v=>setKind(v as any)}><option value="explanation">説明</option><option value="derivation">導出</option><option value="implementation">実装</option><option value="debugging">デバッグ</option><option value="transfer">初見転用</option></Select><Select value={aiUse} onChange={v=>setAiUse(v as AiUse)}><option value="no-ai">No AI</option><option value="hint-only">Hint only</option><option value="ai-explanation">AI explanation</option><option value="ai-debugging">AI debugging</option><option value="ai-generated">AI generated</option></Select><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="タイトル" className="w-full rounded-xl border border-[#d9dde5] p-3 text-sm"/><textarea value={detail} onChange={e=>setDetail(e.target.value)} rows={4} placeholder="メモ" className="w-full resize-none rounded-xl border border-[#d9dde5] p-3 text-sm"/><button onClick={save} className="w-full rounded-xl bg-[#0d1833] p-3 text-sm font-bold text-white">記録</button></div></Panel><div className="space-y-5"><Panel className="p-5"><div className="kicker">Study history</div><div className="mt-3 space-y-2">{studySessions.slice(0,8).map(s=><div key={s.id} className="rounded-xl border border-[#e1e4eb] p-3 text-sm"><div className="font-semibold">{skills.find(x=>x.id===s.skillId)?.nameJa??'Study'} · {Math.round(s.durationSec/60)} min</div><div className="mt-1 text-xs text-[#747d8c]">{new Date(s.startedAt).toLocaleString('ja-JP')} · {s.mode}{s.aiUse?` · ${s.aiUse}`:''}</div></div>)}</div></Panel><Panel className="p-5"><div className="kicker">Evidence history</div><div className="mt-3 space-y-2">{evidence.slice(0,12).map(e=><div key={e.id} className="rounded-xl border border-[#e1e4eb] p-3"><div className="text-sm font-bold">{e.title}</div><div className="mt-1 text-xs text-[#747d8c]">{skills.find(s=>s.id===e.skillId)?.nameJa} · {e.kind} · {e.aiUse}</div></div>)}</div></Panel></div></div>;
}

function QualityScreen(){
  const {feedback,assessmentHistory,lessonProgress,studySessions}=useMasteryStore();
  const coverage=domainCoverage(skills,lessons,assessments);const bad=feedback.filter(f=>f.rating==='bad').length;const good=feedback.filter(f=>f.rating==='good').length;
  const [domain,setDomain]=useState<'all'|Domain>('all');const[sort,setSort]=useState<'bad'|'skip'|'completion'|'dwell'>('bad');
  const itemStats=assessments.map(a=>{const h=assessmentHistory.filter(x=>x.itemId===a.id);const c=h.filter(x=>x.outcome==='correct').length;const w=h.filter(x=>x.outcome==='wrong').length;const skip=h.filter(x=>x.outcome==='skipped').length;const timed=h.filter(x=>x.responseTimeMs);const dist:Record<string,number>={};h.forEach(x=>{if(x.selectedAnswer!==undefined)dist[String(x.selectedAnswer)]=(dist[String(x.selectedAnswer)]??0)+1});return{a,count:h.length,correct:h.length?c/h.length*100:0,wrong:h.length?w/h.length*100:0,skip:h.length?skip/h.length*100:0,avgMs:timed.length?timed.reduce((n,x)=>n+(x.responseTimeMs??0),0)/timed.length:0,dist}}).filter(x=>x.count>0).sort((a,b)=>(b.skip+b.wrong)-(a.skip+a.wrong));
  const lessonRows=lessons.map(l=>{const skill=skills.find(s=>s.id===l.skillId)!;const fb=feedback.filter(f=>f.lessonId===l.id);const lp=lessonProgress[l.id];const dwell=Object.values(lp?.stepTimeSec??{}).reduce((a,n)=>a+n,0);const checkIds=new Set(l.checkpointIds);const attempts=assessmentHistory.filter(a=>checkIds.has(a.itemId));const badCount=fb.filter(f=>f.rating==='bad').length;const commentCount=fb.filter(f=>!!f.comment).length;const skipCount=attempts.filter(a=>a.outcome==='skipped').length;const wrongCount=attempts.filter(a=>a.outcome==='wrong').length;return{l,skill,badRate:fb.length?badCount/fb.length*100:0,comments:commentCount,completion:lp?.completed?100:(lp?.completedStepIds.length??0)/Math.max(1,l.steps.length)*80,skipRate:attempts.length?skipCount/attempts.length*100:0,wrongRate:attempts.length?wrongCount/attempts.length*100:0,dwell,feedbackCount:fb.length}}).filter(x=>domain==='all'||x.skill.domain===domain).sort((a,b)=>sort==='skip'?b.skipRate-a.skipRate:sort==='completion'?a.completion-b.completion:sort==='dwell'?b.dwell-a.dwell:b.badRate-a.badRate);
  const revisionRows=Array.from(new Set(feedback.map(f=>`${f.targetType}:${f.targetId}`))).map(key=>{const [,targetId]=key.split(':');const rows=feedback.filter(f=>f.targetId===targetId);const revisions=Array.from(new Set(rows.map(r=>r.revision))).sort((a,b)=>a-b);return{targetId,revisions,rows}}).filter(x=>x.revisions.length>1);
  const totalStudy=studySessions.reduce((a,s)=>a+s.durationSec,0);
  return <div className="space-y-5"><div className="grid gap-4 sm:grid-cols-4"><Panel className="p-5"><div className="kicker">Feedback</div><div className="metric mt-2 text-4xl font-bold">{feedback.length}</div><div className="mt-2 text-xs text-[#747d8c]">Good {good} · Bad {bad}</div></Panel><Panel className="p-5"><div className="kicker">Lessons</div><div className="metric mt-2 text-4xl font-bold">{lessons.length}</div><div className="mt-2 text-xs text-[#747d8c]">revision tracked</div></Panel><Panel className="p-5"><div className="kicker">Assessments</div><div className="metric mt-2 text-4xl font-bold">{assessments.length}</div><div className="mt-2 text-xs text-[#747d8c]">Recall〜Design</div></Panel><Panel className="p-5"><div className="kicker">Study captured</div><div className="metric mt-2 text-4xl font-bold">{Math.round(totalStudy/60)}</div><div className="mt-2 text-xs text-[#747d8c]">minutes</div></Panel></div>
    <Panel className="p-5"><div className="kicker">Curriculum coverage</div><p className="mt-2 text-xs leading-6 text-[#657083]">教材構成の充足率です。学習者の習得度や実機技能の認定率ではありません。</p><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{coverage.map(c=><div key={c.domain} className="rounded-xl border border-[#e1e4eb] p-4"><div className="flex justify-between"><span className="font-bold">{domainNames[c.domain as Domain]}</span><span className="metric font-bold">{c.percent}%</span></div><div className="mt-3"><Bar value={c.percent}/></div><div className="mt-2 text-[10px] text-[#747d8c]">basic {c.basic}/{c.total} · full {c.full}/{c.total}</div></div>)}</div></Panel>
    <Panel className="p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><div className="kicker">Content quality dashboard</div><div className="mt-1 text-sm text-[#657083]">Bad / skip / wrong / dwell time / completionを同じ画面で確認。</div></div><div className="flex gap-2"><select value={domain} onChange={e=>setDomain(e.target.value as any)} className="rounded-xl border border-[#d9dde5] bg-white px-3 py-2 text-xs"><option value="all">全分野</option>{Object.entries(domainNames).map(([id,n])=><option key={id} value={id}>{n}</option>)}</select><select value={sort} onChange={e=>setSort(e.target.value as any)} className="rounded-xl border border-[#d9dde5] bg-white px-3 py-2 text-xs"><option value="bad">Bad率順</option><option value="skip">Skip率順</option><option value="completion">未完了順</option><option value="dwell">滞在時間順</option></select></div></div><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[760px] text-left text-xs"><thead className="text-[#747d8c]"><tr><th className="pb-2">Lesson</th><th>rev</th><th>完了</th><th>Bad</th><th>comments</th><th>skip</th><th>wrong</th><th>dwell</th></tr></thead><tbody>{lessonRows.map(x=><tr key={x.l.id} className="border-t border-[#eef0f4]"><td className="py-3"><div className="font-bold">{x.l.title}</div><div className="text-[10px] text-[#a1a8b3]">{domainNames[x.skill.domain]}</div></td><td>{x.l.revision}</td><td>{Math.round(x.completion)}%</td><td>{Math.round(x.badRate)}%</td><td>{x.comments}</td><td>{Math.round(x.skipRate)}%</td><td>{Math.round(x.wrongRate)}%</td><td>{Math.round(x.dwell)}s</td></tr>)}</tbody></table></div></Panel>
    <div className="grid gap-5 xl:grid-cols-2"><Panel className="p-5"><div className="kicker">Missing content</div><div className="mt-3 max-h-[430px] space-y-2 overflow-auto">{skills.map(s=>({s,c:coverageForSkill(s,lessons,assessments)})).filter(x=>!x.c.full).sort((a,b)=>a.c.percent-b.c.percent).slice(0,40).map(({s,c})=><div key={s.id} className="rounded-xl border border-[#e1e4eb] p-3"><div className="flex justify-between"><div className="text-sm font-bold">{s.nameJa}</div><div className="text-xs font-bold text-[#c83833]">{c.percent}%</div></div><div className="mt-1 text-[10px] text-[#747d8c]">不足: {Object.entries(c.has).filter(([,v])=>!v).map(([k])=>k).join(', ')}</div></div>)}</div></Panel><Panel className="p-5"><div className="kicker">Assessment quality</div><div className="mt-3 max-h-[430px] space-y-2 overflow-auto">{itemStats.slice(0,30).map(x=><div key={x.a.id} className="rounded-xl border border-[#e1e4eb] p-3"><div className="flex justify-between"><div className="text-sm font-bold">{x.a.id}</div><div className="text-[10px] text-[#a1a8b3]">rev.{x.a.revision}</div></div><div className="mt-1 text-xs text-[#747d8c]">n={x.count} · correct {Math.round(x.correct)}% · wrong {Math.round(x.wrong)}% · skip {Math.round(x.skip)}% · {x.avgMs?`${(x.avgMs/1000).toFixed(1)}s`:'—'}</div><div className="mt-1 text-[10px] text-[#a1a8b3]">options: {Object.entries(x.dist).map(([k,v])=>`${k}:${v}`).join(' / ')||'—'}</div></div>)}{!itemStats.length&&<div className="text-sm text-[#747d8c]">回答データが溜まると問題品質を比較できます。</div>}</div></Panel></div>
    <Panel className="p-5"><div className="kicker">Revision comparison</div>{revisionRows.length?<div className="mt-3 space-y-2">{revisionRows.map(r=><div key={r.targetId} className="rounded-xl border border-[#e1e4eb] p-3 text-xs"><div className="font-bold">{r.targetId}</div><div className="mt-1 text-[#657083]">revisions {r.revisions.join(' → ')} · feedback {r.rows.length}</div></div>)}</div>:<div className="mt-3 text-sm text-[#747d8c]">教材revisionが増えると、同じtargetの改善前後をここで比較できます。</div>}</Panel>
    <Panel className="p-5"><div className="kicker">Recent feedback</div><div className="mt-3 grid gap-3 md:grid-cols-2">{feedback.slice(0,16).map((f:ContentFeedback)=><div key={f.id} className="rounded-xl border border-[#e1e4eb] p-3"><div className="flex justify-between"><span className={`text-xs font-bold ${f.rating==='bad'?'text-[#c83833]':f.rating==='good'?'text-[#1e7c3c]':'text-[#657083]'}`}>{f.rating??'comment'} · {f.targetType}</span><span className="text-[10px] text-[#a1a8b3]">rev.{f.revision}</span></div><div className="mt-2 text-xs text-[#657083]">{f.category}</div>{f.comment&&<div className="mt-2 text-sm">{f.comment}</div>}{f.context&&<div className="mt-2 text-[10px] text-[#a1a8b3]">{f.context.result??''} {f.context.timeSpentSec?`· ${f.context.timeSpentSec}s`:''}</div>}</div>)}</div></Panel>
  </div>;
}

function SettingsScreen(){
  const store=useMasteryStore();const[status,setStatus]=useState('');
  const download=()=>{const data=JSON.stringify({version:3,exportedAt:new Date().toISOString(),states:store.states,evidence:store.evidence,assessmentHistory:store.assessmentHistory,lessonProgress:store.lessonProgress,reviewQueue:store.reviewQueue,studySessions:store.studySessions,activeTimer:store.activeTimer,feedback:store.feedback,practicalSubmissions:store.practicalSubmissions},null,2);const blob=new Blob([data],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='hanabi-study-data-v3.json';a.click();URL.revokeObjectURL(url)};
  const upload=(file:File)=>{const reader=new FileReader();reader.onload=()=>{try{store.importData(JSON.parse(String(reader.result)));setStatus('Imported')}catch{setStatus('Invalid JSON')}};reader.readAsText(file)};
  return <div className="grid gap-5 md:grid-cols-2"><Panel className="p-5"><FileJson size={20} className="text-[#0857a2]"/><h2 className="mt-4 font-bold">Export / Import</h2><button onClick={download} className="mt-5 w-full rounded-xl border border-[#c8ced9] p-3 text-sm font-bold">JSONを書き出す</button><label className="mt-3 block cursor-pointer rounded-xl border border-[#c8ced9] p-3 text-center text-sm font-bold">JSONを読み込む<input type="file" accept="application/json" className="hidden" onChange={e=>e.target.files?.[0]&&upload(e.target.files[0])}/></label>{status&&<div className="mt-3 text-xs text-[#657083]">{status}</div>}</Panel><Panel className="p-5"><RefreshCcw size={20} className="text-[#c83833]"/><h2 className="mt-4 font-bold">Reset</h2><p className="mt-2 text-sm text-[#657083]">Lesson・テスト・復習・実践ノート・タイマー・feedbackを初期化。</p><button onClick={()=>{if(confirm('全ローカル進捗を消しますか？'))store.reset()}} className="mt-5 w-full rounded-xl border border-[#efc5c2] bg-[#f9e9e8] p-3 text-sm font-bold text-[#a92d29]">進捗をリセット</button></Panel></div>;
}

function Select({children,value,onChange}:{children:React.ReactNode;value:string;onChange:(v:string)=>void}){return <select value={value} onChange={e=>onChange(e.target.value)} className="w-full rounded-xl border border-[#d9dde5] bg-white p-3 text-sm">{children}</select>}
