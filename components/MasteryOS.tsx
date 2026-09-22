'use client';
import { Text, tr, displayLocale } from './Text';

import { MathText } from './MathText';
import { FoundationMap } from './FoundationMap';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useLanguageStore } from '@/lib/language-store';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { Background, Controls, MarkerType, MiniMap, ReactFlow, type Edge, type Node } from '@xyflow/react';
import {
  BarChart3, BookOpen, ChevronRight, CircleDot, ClipboardCheck, Database, FileJson,
  GitBranch, Home, Layers3, MessageSquare, RefreshCcw, Route, Search, ShieldCheck,
  Sparkles, TimerReset, X
} from 'lucide-react';
import { assessments, baselineAssessments } from '@/data/assessments';
import { domainNames, kamiyamaSource, resources, roadmapStages, skills } from '@/data/curriculum';
import { foundationBridge } from '@/data/foundations/bridge';
import { lessons } from '@/data/lessons';
import { coverageForSkill, domainCoverage } from '@/lib/content';
import { defaultState, domainStats, foundationDebt, nextSkills, skillStatus } from '@/lib/mastery';
import { useMasteryStore } from '@/lib/store';
import { AiUse, AssessmentItem, AssessmentOutcome, ContentFeedback, Domain, Evidence as EvidenceType, SkillStatus } from '@/lib/types';
import { RetrievalPractice } from './RetrievalPractice';
import { ProjectsScreen } from './ProjectsScreen';
import { LessonPlayer } from './LessonPlayer';
import { RadarChart } from './RadarChart';
import { StudyTimer } from './StudyTimer';

const PlacementTests=dynamic(()=>import('./PlacementTests').then(m=>m.PlacementTests),{ssr:false,loading:()=> <p><Text>{"現在地テストを読み込み中…"}</Text></p>});
const FoundationCourse=dynamic(()=>import('./FoundationCourse').then(m=>m.FoundationCourse),{ssr:false,loading:()=> <p><Text>{"基礎課程を読み込み中…"}</Text></p>});
const nav = [
  ['home','ホーム',Home],['foundations','基礎・ドリル',BookOpen],['learn','学ぶ',BookOpen],['recall','反復',RefreshCcw],['tests','テスト',ClipboardCheck],['status','ステータス',BarChart3],
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
function Pill({status}:{status:SkillStatus}){return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusClass[status]}`}><Text>{statusLabel[status]}</Text></span>}

export default function MasteryOS(){
  useLanguageStore(s=>s.language);
  const [screen,setScreen]=useState<Screen>('home');
  const [foundationTopic,setFoundationTopic]=useState<string|undefined>();
  const [recallSkill,setRecallSkill]=useState('all');
  const [lessonId,setLessonId]=useState<string|null>(null);
  const {states,evidence,assessmentHistory,lessonProgress,reviewQueue}=useMasteryStore();
  const stats=useMemo(()=>domainStats(skills,states),[states]);
  const debts=useMemo(()=>foundationDebt(skills,states,evidence),[states,evidence]);
  const next=useMemo(()=>nextSkills(skills,states),[states]);
  const assessed=skills.filter(s=>{const active=lessons.some(l=>l.skillId===s.id&&((lessonProgress[l.id]?.completedStepIds.length??0)>0||lessonProgress[l.id]?.completed));return skillStatus(states[s.id]??defaultState(),active)!=='not-started'}).length;
  const due=reviewQueue.filter(r=>new Date(r.dueAt).getTime()<=Date.now()).length;

  if(screen==='learn'&&lessonId){
    const lesson=lessons.find(l=>l.id===lessonId);
    if(lesson)return <Shell screen={screen} setScreen={setScreen}><LessonPlayer key={lesson.id} lesson={lesson} onOpenLesson={setLessonId} onOpenFoundation={id=>{setFoundationTopic(foundationBridge[id]);setScreen('foundations')}} onOpenRecall={id=>{setRecallSkill(id);setScreen('recall')}} onBack={()=>setLessonId(null)}/></Shell>;
  }

  return <Shell screen={screen} setScreen={setScreen} assessed={assessed}>
    {screen==='home'&&<HomeScreen stats={stats} next={next} assessed={assessed} attempts={assessmentHistory.length} due={due} setScreen={setScreen}/>} 
    {screen==='foundations'&&<FoundationCourse key={foundationTopic??'all'} initialTopic={foundationTopic} onOpenTests={()=>setScreen('tests')}/>}
    {screen==='learn'&&<LearnScreen onOpen={setLessonId}/>} 
    {screen==='recall'&&<RetrievalPractice key={recallSkill} initialSkill={recallSkill} onOpenLesson={id=>{setLessonId(id);setScreen('learn')}}/>}
    {screen==='tests'&&<PlacementTests onOpenLesson={id=>{setLessonId(id);setScreen('learn')}} onOpenFoundation={id=>{setFoundationTopic(id);setScreen('foundations')}}/>}
    {screen==='status'&&<StatusScreen stats={stats}/>} 
    {screen==='roadmap'&&<RoadmapScreen/>}
    {screen==='map'&&<ProgressMaps onOpenFoundation={id=>{setFoundationTopic(id);setScreen('foundations')}}/>}
    {screen==='today'&&<TodayScreen/>}
    {screen==='evidence'&&<EvidenceScreen/>}
    {screen==='projects'&&<ProjectsScreen onOpenLesson={id=>{setLessonId(id);setScreen('learn')}}/>}
    {screen==='quality'&&<QualityScreen/>}
    {screen==='settings'&&<SettingsScreen/>}
  </Shell>;
}

function Shell({children,screen,setScreen,assessed=0}:{children:React.ReactNode;screen:Screen;setScreen:(s:Screen)=>void;assessed?:number}){
  return <div className="min-h-screen lg:grid lg:grid-cols-[252px_1fr]">
    <aside className="border-b border-[#e1e4eb] bg-white p-4 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:border-b-0 lg:border-r">
      <button onClick={()=>setScreen('home')} className="mb-7 flex w-full items-center gap-3 px-2 pt-2 text-left"><img src="/brand/hanabi-normal.png" alt="Hanabi" width={2170} height={1581} className="h-12 w-12 shrink-0 object-contain"/><div><div className="text-[10px] font-bold uppercase tracking-[.16em] text-[#657083]">FRC Team 9494 Hanabi</div><div className="mt-0.5 text-base font-bold text-[#0d1833]">Hanabi Study</div></div></button>
      <div className="hanabi-spectrum mb-5" aria-hidden="true"><span/><span/><span/><span/><span/></div>
      <LanguageSwitcher/>
      <nav className="grid grid-cols-5 gap-1 sm:grid-cols-10 lg:grid-cols-1 lg:gap-1.5">{nav.map(([id,label,Icon])=><button key={id} onClick={()=>setScreen(id)} aria-label={tr(label)} title={tr(label)} className={`flex items-center justify-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition lg:justify-start lg:text-sm ${screen===id?'bg-[#e9edf5] text-[#0d1833]':'text-[#657083] hover:bg-[#f8f9fb]'}`}><Icon size={17}/><span className="hidden sm:inline"><Text>{label}</Text></span></button>)}</nav>
      <div className="mt-8 hidden rounded-xl border border-[#e1e4eb] bg-[#f8f9fb] p-4 lg:block"><div className="kicker">Curriculum</div><div className="mt-2 flex items-baseline justify-between"><span className="text-sm font-bold"><Text>{assessed}</Text>/<Text>{skills.length}</Text></span><span className="text-[11px] text-[#747d8c]">skills started</span></div><div className="mt-3"><Bar value={assessed/skills.length*100}/></div></div>
    </aside>
    <main className="min-w-0 p-4 sm:p-6 lg:p-8"><header className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><div className="kicker">HANABI STUDY</div><h1 className="mt-1 text-2xl font-bold tracking-tight"><Text>{nav.find(n=>n[0]===screen)?.[1]}</Text></h1></div><div className="flex items-center gap-2 rounded-full border border-[#e1e4eb] bg-white px-3 py-2 text-xs font-semibold text-[#657083]"><CircleDot size={13} className="text-[#1e7c3c]"/>Local v0.3</div></header>{children}</main>
  </div>;
}

function HomeScreen({stats,next,assessed,attempts,due,setScreen}:{stats:ReturnType<typeof domainStats>;next:ReturnType<typeof nextSkills>;assessed:number;attempts:number;due:number;setScreen:(s:Screen)=>void}){
  const ready=next.filter(n=>n.ready);
  const completed=useMasteryStore(s=>Object.values(s.lessonProgress).filter(p=>p.completed).length);
  const cards=[
    {title:'基礎・ドリル',detail:'100単元・100,000問',meta:'中学数学まで戻ってつまずきを解消',screen:'foundations' as Screen,color:'#0857a2'},
    {title:'学ぶ',detail:`${completed}/${lessons.length} lessons`,meta:`${skills.length} skills`,screen:'learn' as Screen,color:'#0857a2'},
    {title:'テスト',detail:'できるところから進む',meta:`現在地を確認 · 復習待ち ${due}`,screen:'tests' as Screen,color:'#c83833'},
    {title:'ステータス',detail:`${assessed}/${skills.length}`,meta:'8分野の達成度',screen:'status' as Screen,color:'#714086'},
    {title:'制作・修了',detail:'8つの統合制作',meta:'機械・電装・制御から引継ぎまで',screen:'projects' as Screen,color:'#1e7c3c'},
  ];
  return <div className="space-y-5">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(c=><button key={c.title} onClick={()=>setScreen(c.screen)} className="panel p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md"><div className="h-2 w-10 rounded-full" style={{background:c.color}}/><div className="mt-5 text-xs font-bold text-[#657083]"><Text>{c.title}</Text></div><div className="mt-1 truncate text-xl font-bold"><Text>{c.detail}</Text></div><div className="mt-2 text-xs text-[#747d8c]"><Text>{c.meta}</Text></div></button>)}</div>
    <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
      <Panel className="p-5 sm:p-6"><div className="flex items-center justify-between"><div><div className="kicker">Domains</div><h2 className="mt-1 font-bold"><Text>{"現在地"}</Text></h2></div><button onClick={()=>setScreen('status')} className="text-xs font-bold text-[#0857a2]"><Text>{"詳細"}</Text></button></div><div className="mt-4"><RadarChart labels={stats.map(s=>domainNames[s.domain as Domain])} values={stats.map(s=>s.score)} size={330}/></div></Panel>
      <Panel className="p-5 sm:p-6"><div className="kicker">Next</div><h2 className="mt-1 font-bold"><Text>{"次に進めるSkill"}</Text></h2><div className="mt-4 space-y-3">{ready.slice(0,7).map(n=><div key={n.skill.id} className="flex items-center gap-3 rounded-xl border border-[#e1e4eb] p-3"><span className="h-2.5 w-2.5 rounded-full bg-[#1e7c3c]"/><div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold"><Text>{n.skill.nameJa}</Text></div><div className="mt-1 text-xs text-[#747d8c]"><Text>{domainNames[n.skill.domain]}</Text> · <Text>{n.skill.section}</Text></div></div><ChevronRight size={15} className="text-[#a1a8b3]"/></div>)}</div></Panel>
    </div>
  </div>;
}

function LearnScreen({onOpen}:{onOpen:(id:string)=>void}){
  const {lessonProgress}=useMasteryStore();
  const [query,setQuery]=useState('');
  const [domain,setDomain]=useState<'all'|Domain>('all');
  const [track,setTrack]=useState('all');
  const list=lessons.filter(l=>{const s=skills.find(x=>x.id===l.skillId)!;return(track==='all'||(l.track??'intro')===track)&&(domain==='all'||s.domain===domain)&&(`${l.title} ${l.summary} ${s.nameJa} ${tr(l.title)} ${tr(l.summary)} ${tr(s.nameJa)}`.toLowerCase().includes(query.toLowerCase()))});
  return <div className="grid gap-5 xl:grid-cols-[1fr_310px]">
    <div><div className="mb-4 flex flex-col gap-3 sm:flex-row"><div className="flex flex-1 items-center gap-2 rounded-xl border border-[#d9dde5] bg-white px-4"><Search size={16} className="text-[#747d8c]"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={tr("Lessonを検索")} className="w-full bg-transparent py-3 text-sm outline-none"/></div><select value={domain} onChange={e=>setDomain(e.target.value as any)} className="rounded-xl border border-[#d9dde5] bg-white px-3 text-sm"><option value="all">{tr("全分野")}</option>{Object.entries(domainNames).map(([id,n])=><option key={id} value={id}><Text plain>{n}</Text></option>)}</select><select aria-label={tr("教材の段階")} value={track} onChange={e=>setTrack(e.target.value)} className="rounded-xl border bg-white p-3 text-sm"><option value="all">{tr("全段階")}</option><option value="foundation">{tr("基礎")}</option><option value="application">{tr("応用")}</option><option value="intro">{tr("短編入門")}</option></select></div>
      {list.length===0&&<p className="panel p-5 text-sm text-[#657083]"><Text>{"一致する教材がありません。検索語や分野を変えてください。"}</Text></p>}
      <div className="grid gap-4 md:grid-cols-2">{list.map(l=>{const s=skills.find(x=>x.id===l.skillId)!;const p=lessonProgress[l.id];const done=p?.completedStepIds.length??0;return <button key={l.id} onClick={()=>onOpen(l.id)} className="panel p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-start justify-between gap-3"><div><div className="kicker"><Text>{domainNames[s.domain]}</Text> · <Text>{s.section}</Text></div><h3 className="mt-2 font-bold leading-6"><Text>{l.title}</Text></h3></div>{p?.completed&&<span className="rounded-full border border-[#bfd3e5] bg-[#e6eff7] px-2.5 py-1 text-[10px] font-bold text-[#0857a2]"><Text>{"Lesson完了"}</Text></span>}</div><p className="mt-3 text-sm leading-6 text-[#657083]"><Text>{l.summary}</Text></p><div className="mt-4"><Bar value={p?.completed?100:done/l.steps.length*75}/></div><div className="mt-3 flex flex-wrap gap-2 text-[10px] text-[#747d8c]"><span><Text>{l.track==='application' ? '応用・実習付き' : l.track==='foundation' ? '基礎・実習付き' : '短編入門'}</Text></span><span><Text>{l.estimatedMinutes}</Text> min</span><span>rev.<Text>{l.revision}</Text></span>{s.schoolMappings?.slice(0,1).map(m=><span key={m.courseName} className="rounded-full bg-[#f0f1f4] px-2 py-1"><Text>{"神山: "}</Text><Text>{m.courseName}</Text></span>)}</div></button>})}</div>
    </div>
    <div className="space-y-5"><Panel className="p-5"><div className="kicker">In-app content</div><div className="metric mt-2 text-4xl font-bold"><Text>{lessons.length}</Text></div><p className="mt-2 text-sm leading-6 text-[#657083]"><Text>{"全78スキルに基礎→応用の2段階と実習。反復画面で理由や手順を思い出し、時間を空けて再確認します。短編入門は導入用です。制作・修了画面で8つの統合課題と提出条件を確認できます。"}</Text></p></Panel><Panel className="p-5"><div className="kicker">External references</div><div className="mt-3 space-y-2">{resources.map(r=><a key={r.id} href={r.url} target="_blank" rel="noreferrer" className="block rounded-xl border border-[#e1e4eb] p-3 text-xs font-semibold text-[#0857a2]"><Text>{r.provider}</Text> · <Text>{r.title}</Text></a>)}</div></Panel></div>
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
      <Panel className="p-7"><div className="kicker">Baseline complete</div><h2 className="mt-2 text-2xl font-bold"><Text>{"Skillごとの現在地"}</Text></h2><p className="mt-2 text-sm text-[#657083]"><Text>{"BaselineだけではMasterになりません。Checkpointと時間を空けたReviewを重ねて判定します。"}</Text></p></Panel>
      <Panel className="p-5"><div className="kicker">Results by skill</div><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{rows.map(r=><div key={r.skill.id} className="rounded-xl border border-[#e1e4eb] p-4"><div className="flex items-start justify-between gap-2"><div><div className="text-sm font-bold"><Text>{r.skill.nameJa}</Text></div><div className="mt-1 text-[11px] text-[#747d8c]">correct <Text>{r.correct}</Text> · wrong <Text>{r.wrong}</Text> · skip <Text>{r.skipped}</Text></div></div><Pill status={skillStatus(r.state)}/></div><div className="mt-3"><Bar value={r.state.score}/></div></div>)}</div></Panel>
      <Panel className="p-5"><div className="kicker">Attempt history</div><div className="mt-3 grid gap-2 sm:grid-cols-2">{[...assessmentHistory].reverse().filter(a=>a.source==='baseline').slice(0,16).map(a=><div key={a.id} className="flex items-center justify-between rounded-xl border border-[#e1e4eb] p-3 text-xs"><span><Text>{skills.find(s=>s.id===a.skillId)?.nameJa}</Text></span><span className={a.outcome==='correct'?'text-[#1e7c3c]':a.outcome==='wrong'?'text-[#c83833]':'text-[#8b5b08]'}><Text>{a.outcome}</Text></span></div>)}</div></Panel>
      <Panel className="p-5"><div className="kicker">Recommended next lessons</div><div className="mt-3 grid gap-2 sm:grid-cols-2">{recommendations.map(({r,lesson})=><button key={r.skill.id} onClick={()=>onOpenLesson(lesson!.id)} className="rounded-xl border border-[#e1e4eb] p-3 text-left"><div className="text-sm font-bold"><Text>{r.skill.nameJa}</Text></div><div className="mt-1 text-xs text-[#0857a2]"><Text>{lesson!.title}</Text> →</div></button>)}</div></Panel>
    </div>;
  }
  const skill=skills.find(s=>s.id===item.skillId)!;
  return <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
    <Panel className="p-6 sm:p-8"><div className="flex items-center justify-between"><div><div className="kicker">Adaptive baseline · <Text>{done+1}</Text>/<Text>{baselineAssessments.length}</Text></div><div className="mt-2 text-sm font-semibold text-[#657083]"><Text>{skill.nameJa}</Text> · <Text>{item.competency}</Text></div></div><div className="text-3xl font-bold text-[#e1e4eb]">L<Text>{item.difficulty}</Text></div></div><h2 className="mt-8 max-w-3xl text-xl font-bold leading-8"><MathText>{item.prompt}</MathText></h2>{item.format==='mcq'?<div className="mt-6 grid gap-3">{item.options?.map((o,i)=><button key={o} onClick={()=>setChoice(i)} className={`rounded-xl border p-4 text-left text-sm ${choice===i?'border-[#0857a2] bg-[#e6eff7]':'border-[#e1e4eb] hover:bg-[#f8f9fb]'}`}><Text>{String.fromCharCode(65+i)}</Text>. <MathText>{o}</MathText></button>)}</div>:<input value={numeric} onChange={e=>setNumeric(e.target.value)} inputMode="decimal" placeholder={tr("数値を入力")} className="mt-6 w-full rounded-xl border border-[#d9dde5] p-4 outline-none focus:border-[#0857a2]"/>}<div className="mt-7 grid gap-2 sm:grid-cols-2"><button onClick={()=>submit('skipped')} className="rounded-xl border border-[#d9dde5] p-3 text-sm font-bold text-[#657083]"><Text>{"わからない / スキップ"}</Text></button><button onClick={()=>submit()} disabled={item.format==='mcq'?choice===null:!numeric.trim()} className="rounded-xl bg-[#0d1833] p-3 text-sm font-bold text-white disabled:opacity-30"><Text>{"回答する"}</Text></button></div><div className="mt-3 text-center text-[10px] text-[#a1a8b3]"><Text>{"A–D / 1–4: 選択 · Enter: 回答 · S: スキップ"}</Text></div></Panel>
    <div className="space-y-5"><Panel className="p-5"><div className="kicker">Assessment design</div><div className="mt-4 space-y-3 text-sm leading-6 text-[#657083]"><p><Text>{"正答・誤答・skipを別々に保存。"}</Text></p><p><Text>{"Recall / Calculate / Transfer / Debug / Designを区別。"}</Text></p><p><Text>{"誤答時は前提Skillへadaptiveに戻る。"}</Text></p><p><Text>{"Reviewでは同じvariant groupの別問題を優先。"}</Text></p></div></Panel><Panel className="p-5"><div className="kicker">Recent</div><div className="mt-3 space-y-2">{recent.map(a=><div key={a.id} className="flex items-center justify-between rounded-lg border border-[#e1e4eb] px-3 py-2 text-xs"><span className="truncate"><Text>{skills.find(s=>s.id===a.skillId)?.nameJa}</Text></span><span className={a.outcome==='correct'?'text-[#1e7c3c]':a.outcome==='wrong'?'text-[#c83833]':'text-[#8b5b08]'}><Text>{a.outcome}</Text></span></div>)}</div></Panel></div>
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
    <div className="grid gap-5 xl:grid-cols-[1fr_1fr]"><Panel className="p-5 sm:p-6"><div className="kicker">Domain achievement</div><h2 className="mt-1 font-bold"><Text>{"分野別達成度"}</Text></h2><RadarChart labels={stats.map(s=>domainNames[s.domain as Domain])} values={stats.map(s=>s.score)} size={390} selectedIndex={selected} onSelect={setSelected}/><p className="mt-2 text-center text-xs text-[#747d8c]"><Text>{"軸をクリックすると分野詳細を切り替えます。Assessment / Retention / Evidenceを重く反映。"}</Text></p></Panel>
      <Panel className="p-5 sm:p-6"><div className="flex items-start justify-between"><div><div className="kicker"><Text>{domainNames[domain]}</Text></div><h2 className="mt-1 text-xl font-bold"><Text>{Math.round(selectedStat.score)}</Text> / 100</h2></div><div className="text-right text-xs text-[#747d8c]">Retention <Text>{Math.round(selectedStat.retention)}</Text><br/>7 days <Text>{studyMin}</Text> min</div></div><div className="mt-4"><Bar value={selectedStat.score}/></div><div className="mt-5 grid grid-cols-3 gap-2"><div className="rounded-xl bg-[#f8f9fb] p-3"><div className="text-[10px] text-[#747d8c]">Master</div><div className="metric mt-1 text-xl font-bold"><Text>{mastered.length}</Text></div></div><div className="rounded-xl bg-[#f8f9fb] p-3"><div className="text-[10px] text-[#747d8c]">Learning</div><div className="metric mt-1 text-xl font-bold"><Text>{learning.length}</Text></div></div><div className="rounded-xl bg-[#f8f9fb] p-3"><div className="text-[10px] text-[#747d8c]">Total</div><div className="metric mt-1 text-xl font-bold"><Text>{domainSkills.length}</Text></div></div></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><div><div className="kicker">Next</div><div className="mt-2 space-y-2">{next.map(n=><div key={n.skill.id} className="rounded-lg border border-[#e1e4eb] p-2 text-xs font-semibold"><Text>{n.skill.nameJa}</Text></div>)}</div></div><div><div className="kicker">Weakness</div><div className="mt-2 space-y-2">{weak.map(s=><div key={s.id} className="flex justify-between rounded-lg border border-[#e1e4eb] p-2 text-xs"><span><Text>{s.nameJa}</Text></span><span><Text>{Math.round(states[s.id]?.score??0)}</Text></span></div>)}</div></div></div></Panel></div>
    <Panel className="p-5"><div className="kicker"><Text>{domainNames[domain]}</Text> skills</div><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{domainSkills.map(s=>{const st=states[s.id]??defaultState();const status=skillStatus(st,hasActivity(s.id));return <div key={s.id} className="rounded-xl border border-[#e1e4eb] p-4"><div className="flex items-start justify-between gap-2"><div><div className="text-sm font-bold"><Text>{s.nameJa}</Text></div><div className="mt-1 text-[11px] text-[#747d8c]"><Text>{s.section}</Text></div></div><Pill status={status}/></div><div className="mt-3"><Bar value={st.score}/></div><div className="mt-2 text-[10px] text-[#747d8c]">score <Text>{Math.round(st.score)}</Text> · retention <Text>{Math.round(st.retentionScore)}</Text></div></div>})}</div></Panel>
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
    <Panel className="p-5"><div className="kicker">Connected roadmap</div><p className="mt-2 text-sm text-[#657083]"><Text>{"基礎 → Engineering Core → FRC Core → Robotics → Advanced。モバイルでは縦、デスクトップでは横につながります。"}</Text></p></Panel>
    <div className="flex flex-col gap-3 lg:flex-row lg:items-start">{roadmapStages.map((stage,idx)=><div key={stage.id} className="contents"><div className="min-w-0 flex-1 space-y-3"><div className="px-2"><div className="text-xs font-bold text-[#0857a2]"><Text>{idx+1}</Text>. <Text>{stage.title}</Text></div><div className="mt-1 text-xs text-[#747d8c]"><Text>{stage.subtitle}</Text></div></div>{stage.sections.map(section=>{const st=sectionState(section);const current=currentKey===section;return <div key={section} className={`rounded-2xl border bg-white p-4 shadow-sm ${current?'border-[#0857a2] ring-2 ring-[#0857a2]/10':'border-[#e1e4eb]'}`}><div className="flex items-center justify-between gap-2"><div className="text-sm font-bold"><Text>{section}</Text></div><div className="flex items-center gap-2">{current&&<span className="rounded-full bg-[#e6eff7] px-2 py-1 text-[9px] font-bold text-[#0857a2]"><Text>{"現在地"}</Text></span>}<Pill status={st.status}/></div></div><div className="mt-3"><Bar value={st.avg}/></div><div className="mt-2 text-[10px] text-[#747d8c]"><Text>{st.set.length}</Text> skills · <Text>{Math.round(st.avg)}</Text>%</div><div className="mt-3 space-y-1">{st.set.slice(0,4).map(s=><div key={s.id} className="truncate text-[11px] text-[#657083]">• <Text>{s.nameJa}</Text></div>)}{st.set.length>4&&<div className="text-[10px] text-[#a1a8b3]">+<Text>{st.set.length-4}</Text></div>}</div>{st.missing.length>0&&<div className="mt-3 rounded-lg bg-[#fff4dc] p-2 text-[10px] leading-4 text-[#8b5b08]"><Text>{"前提: "}</Text><Text>{st.missing.slice(0,4).map(x=>x!.nameJa).join(' / ')}</Text><Text>{st.missing.length>4?' …':''}</Text></div>}</div>})}</div>{idx<roadmapStages.length-1&&<div className="flex items-center justify-center text-2xl text-[#c8ced9] lg:h-24 lg:w-8"><span className="lg:hidden">↓</span><span className="hidden lg:inline">→</span></div>}</div>)}</div>
    <KamiyamaPanel/>
  </div>;
}

function KamiyamaPanel(){
  const [relation,setRelation]=useState('all');
  const mapped=skills.filter(s=>s.schoolMappings?.length).length;
  const rows=skills.flatMap(s=>(s.schoolMappings??[]).map(m=>({skill:s,m}))).filter(x=>relation==='all'||x.m.relation===relation);
  return <Panel className="p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="kicker">Kamiyama mapping · <Text>{kamiyamaSource.year}</Text></div><h2 className="mt-1 font-bold"><Text>{"神山の授業との対応"}</Text></h2><p className="mt-2 max-w-3xl text-sm leading-6 text-[#657083]"><Text>{mapped}</Text>/<Text>{skills.length}</Text><Text>{" Skillに学校科目mappingあり。履修済みでも自動Masterにはしません。mappingは年度付きで保持し、学校固有情報とMasteryを分離しています。"}</Text></p></div><div className="flex gap-2"><a href={kamiyamaSource.curriculumUrl} target="_blank" rel="noreferrer" className="rounded-xl border border-[#d9dde5] px-3 py-2 text-xs font-bold text-[#0857a2]"><Text>{"公式Curriculum"}</Text></a><a href={kamiyamaSource.syllabusUrl} target="_blank" rel="noreferrer" className="rounded-xl border border-[#d9dde5] px-3 py-2 text-xs font-bold text-[#0857a2]"><Text>{"授業一覧"}</Text></a></div></div><div className="mt-4 flex flex-wrap gap-2">{['all','direct','partial','prerequisite','extension','gap'].map(r=><button key={r} onClick={()=>setRelation(r)} className={`rounded-full border px-3 py-1.5 text-[10px] font-bold ${relation===r?'border-[#0857a2] bg-[#e6eff7] text-[#0857a2]':'border-[#d9dde5] text-[#657083]'}`}><Text>{r}</Text></button>)}</div><div className="mt-5 grid max-h-[420px] gap-3 overflow-auto md:grid-cols-2 xl:grid-cols-3">{rows.map(({skill,m},i)=><div key={`${skill.id}-${m.courseName}-${i}`} className="rounded-xl border border-[#e1e4eb] p-3"><div className="flex items-start justify-between gap-2"><div className="text-sm font-bold"><Text>{skill.nameJa}</Text></div><span className="rounded-full bg-[#f0f1f4] px-2 py-1 text-[9px] font-bold"><Text>{m.relation}</Text></span></div><div className="mt-2 text-xs text-[#657083]"><Text>{m.courseName}</Text><Text>{m.grade?` · ${m.grade}年`:''}</Text></div><div className="mt-1 text-[10px] text-[#a1a8b3]">source <Text>{m.sourceYear}</Text></div></div>)}</div></Panel>;
}

function ProgressMaps({onOpenFoundation}:{onOpenFoundation:(id:string)=>void}){
  const [mode,setMode]=useState<'foundations'|'skills'>('foundations');
  return <div><div className="mb-4 flex gap-2"><button aria-pressed={mode==='foundations'} className={`rounded-xl border px-4 py-2 ${mode==='foundations'?'bg-[#e9edf5]':''}`} onClick={()=>setMode('foundations')}><Text>基礎・ドリル</Text></button><button aria-pressed={mode==='skills'} className={`rounded-xl border px-4 py-2 ${mode==='skills'?'bg-[#e9edf5]':''}`} onClick={()=>setMode('skills')}>FRC <Text>スキルマップ</Text></button></div>{mode==='foundations'?<FoundationMap onOpen={onOpenFoundation}/>:<SkillMap/>}</div>;
}

function SkillMap(){
  const {states,lessonProgress}=useMasteryStore();const[selected,setSelected]=useState<string|null>(null);
  const hasActivity=(skillId:string)=>lessons.some(l=>l.skillId===skillId&&((lessonProgress[l.id]?.completedStepIds.length??0)>0||lessonProgress[l.id]?.completed));
  const nodes:Node[]=skills.map(s=>{const st=states[s.id]??defaultState();return{id:s.id,position:{x:s.x,y:s.y},data:{label:<div className="min-w-[125px]"><div className="text-[9px] font-bold uppercase tracking-wider text-[#747d8c]"><Text>{domainNames[s.domain]}</Text></div><div className="mt-1 text-xs font-bold"><Text>{s.nameJa}</Text></div><div className="mt-2"><Pill status={skillStatus(st,hasActivity(s.id))}/>{st.testPassed&&<div className="mt-1 text-[9px] text-[#1e7c3c]"><Text>{"テスト合格"}</Text></div>}</div></div>},style:{background:skillStatus(st)==='mastered'?'#e6f3ea':'#fff',border:selected===s.id?'2px solid #0857a2':'1px solid #d9dde5',borderRadius:10,padding:10,width:160}}});
  const edges:Edge[]=skills.flatMap(s=>s.prerequisites.map(p=>({id:`${p}-${s.id}`,source:p,target:s.id,markerEnd:{type:MarkerType.ArrowClosed},style:{stroke:'#c8ced9',strokeWidth:1}})));
  const sk=skills.find(s=>s.id===selected);const st=sk?(states[sk.id]??defaultState()):null;
  return <div className="relative h-[calc(100vh-145px)] min-h-[650px] overflow-hidden rounded-2xl border border-[#e1e4eb] bg-white"><ReactFlow nodes={nodes} edges={edges} fitView minZoom={.15} maxZoom={1.8} onNodeClick={(_,n)=>setSelected(n.id)}><Background gap={26} size={1} color="#e5e7eb"/><Controls/><MiniMap pannable zoomable nodeColor={node=>String(node.style?.background??'#fff')} maskColor="rgba(245,246,249,.74)"/></ReactFlow>{sk&&st&&<div className="absolute right-4 top-4 z-10 w-[min(410px,calc(100%-32px))] rounded-2xl border border-[#d9dde5] bg-white/95 p-5 shadow-xl backdrop-blur"><button onClick={()=>setSelected(null)} className="absolute right-3 top-3 text-[#747d8c]"><X size={17}/></button><div className="kicker"><Text>{domainNames[sk.domain]}</Text> · <Text>{sk.section}</Text></div><h3 className="mt-1 text-lg font-bold"><Text>{sk.nameJa}</Text></h3><p className="mt-3 text-sm leading-6 text-[#657083]"><Text>{sk.description}</Text></p><div className="mt-4 flex items-center justify-between"><Pill status={skillStatus(st,hasActivity(sk.id))}/><span className="metric text-sm text-[#657083]"><Text>{Math.round(st.score)}</Text>%</span></div><div className="mt-3"><Bar value={st.score}/></div><div className="mt-5 text-xs font-bold text-[#657083]">FRC</div><div className="mt-2 flex flex-wrap gap-2">{sk.frcApplications.map(a=><span key={a} className="rounded-lg bg-[#f8f9fb] px-2 py-1 text-xs"><Text>{a}</Text></span>)}</div>{sk.schoolMappings?.length?<><div className="mt-5 text-xs font-bold text-[#657083]"><Text>{"神山 2026"}</Text></div><div className="mt-2 space-y-1">{sk.schoolMappings.map(m=><div key={`${m.courseName}-${m.relation}`} className="text-xs text-[#657083]"><Text>{m.courseName}</Text> · <Text>{m.relation}</Text></div>)}</div></>:null}</div>}</div>;
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
  return <Panel className="p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="kicker">Spaced repetition</div><h2 className="mt-1 font-bold"><Text>{"復習キュー"}</Text></h2><div className="mt-1 text-xs text-[#747d8c]">review attempts <Text>{recallCount}</Text></div></div><div className="flex gap-2">{([['due',due.length,'Due'],['weakness',weakness.length,'Weakness'],['cumulative',cumulative.length,'Cumulative']] as const).map(([id,count,label])=><button key={id} onClick={()=>setMode(id)} className={`rounded-xl border px-3 py-2 text-xs font-bold ${mode===id?'border-[#714086] bg-[#f3ecf6] text-[#714086]':'border-[#d9dde5] text-[#657083]'}`}><Text>{label}</Text> <Text>{count}</Text></button>)}</div></div>{!item?<div className="mt-5 rounded-xl border border-dashed border-[#d9dde5] p-6 text-sm text-[#747d8c]"><Text>{"このキューに問題はありません。"}</Text></div>:<div className="mt-5 rounded-2xl border border-[#e1e4eb] p-5"><div className="flex justify-between text-xs font-bold text-[#714086]"><span>Stage <Text>{r.stage}</Text> · <Text>{item.competency}</Text></span><span><Text>{r.intervalHours<24?`${r.intervalHours}h`:`${Math.round(r.intervalHours/24)}d`}</Text> interval</span></div><div className="mt-3 font-bold leading-7"><MathText>{item.prompt}</MathText></div>{item.format==='mcq'?<div className="mt-4 grid gap-2">{item.options?.map((o,i)=><button key={o} onClick={()=>setChoice(i)} className={`rounded-xl border p-3 text-left text-sm ${choice===i?'border-[#0857a2] bg-[#e6eff7]':'border-[#d9dde5]'}`}><MathText>{o}</MathText></button>)}</div>:<input value={numeric} onChange={e=>setNumeric(e.target.value)} className="mt-4 w-full rounded-xl border border-[#d9dde5] p-3" placeholder={tr("数値を入力")}/>}<div className="mt-4 grid gap-2 sm:grid-cols-2"><button onClick={()=>submit('skipped')} className="rounded-xl border border-[#d9dde5] p-3 text-sm font-bold text-[#657083]"><Text>{"思い出せない"}</Text></button><button onClick={()=>submit()} disabled={item.format==='mcq'?choice===null:!numeric.trim()} className="rounded-xl bg-[#0d1833] p-3 text-sm font-bold text-white disabled:opacity-30"><Text>{"回答"}</Text></button></div></div>}</Panel>;
}

function EvidenceScreen(){
  const {evidence,addEvidence,studySessions}=useMasteryStore();const[skillId,setSkillId]=useState(skills[0].id);const[kind,setKind]=useState<EvidenceType['kind']>('implementation');const[aiUse,setAiUse]=useState<AiUse>('no-ai');const[title,setTitle]=useState('');const[detail,setDetail]=useState('');
  const save=()=>{if(!title.trim())return;addEvidence({id:crypto.randomUUID(),skillId,kind,title:title.trim(),detail:detail.trim(),aiUse,strength:3,createdAt:new Date().toISOString()});setTitle('');setDetail('')};
  return <div className="grid gap-5 xl:grid-cols-[390px_1fr]"><Panel className="p-5"><div className="kicker">Evidence</div><h2 className="mt-1 font-bold"><Text>{"成果を記録"}</Text></h2><div className="mt-5 space-y-3"><Select value={skillId} onChange={setSkillId}>{skills.map(s=><option key={s.id} value={s.id}><Text plain>{s.nameJa}</Text></option>)}</Select><Select value={kind} onChange={v=>setKind(v as any)}><option value="explanation">{tr("説明")}</option><option value="derivation">{tr("導出")}</option><option value="implementation">{tr("実装")}</option><option value="debugging">{tr("デバッグ")}</option><option value="transfer">{tr("初見転用")}</option></Select><Select value={aiUse} onChange={v=>setAiUse(v as AiUse)}><option value="no-ai">No AI</option><option value="hint-only">Hint only</option><option value="ai-explanation">AI explanation</option><option value="ai-debugging">AI debugging</option><option value="ai-generated">AI generated</option></Select><input value={title} onChange={e=>setTitle(e.target.value)} placeholder={tr("タイトル")} className="w-full rounded-xl border border-[#d9dde5] p-3 text-sm"/><textarea value={detail} onChange={e=>setDetail(e.target.value)} rows={4} placeholder={tr("メモ")} className="w-full resize-none rounded-xl border border-[#d9dde5] p-3 text-sm"/><button onClick={save} className="w-full rounded-xl bg-[#0d1833] p-3 text-sm font-bold text-white"><Text>{"記録"}</Text></button></div></Panel><div className="space-y-5"><Panel className="p-5"><div className="kicker">Study history</div><div className="mt-3 space-y-2">{studySessions.slice(0,8).map(s=><div key={s.id} className="rounded-xl border border-[#e1e4eb] p-3 text-sm"><div className="font-semibold"><Text>{skills.find(x=>x.id===s.skillId)?.nameJa??'Study'}</Text> · <Text>{Math.round(s.durationSec/60)}</Text> min</div><div className="mt-1 text-xs text-[#747d8c]"><Text>{new Date(s.startedAt).toLocaleString(displayLocale())}</Text> · <Text>{s.mode}</Text><Text>{s.aiUse?` · ${s.aiUse}`:''}</Text></div></div>)}</div></Panel><Panel className="p-5"><div className="kicker">Evidence history</div><div className="mt-3 space-y-2">{evidence.slice(0,12).map(e=><div key={e.id} className="rounded-xl border border-[#e1e4eb] p-3"><div className="text-sm font-bold">{e.title}</div><div className="mt-1 text-xs text-[#747d8c]"><Text>{skills.find(s=>s.id===e.skillId)?.nameJa}</Text> · <Text>{e.kind}</Text> · <Text>{e.aiUse}</Text></div></div>)}</div></Panel></div></div>;
}

function QualityScreen(){
  const {feedback,assessmentHistory,lessonProgress,studySessions}=useMasteryStore();
  const coverage=domainCoverage(skills,lessons,assessments);const bad=feedback.filter(f=>f.rating==='bad').length;const good=feedback.filter(f=>f.rating==='good').length;
  const [domain,setDomain]=useState<'all'|Domain>('all');const[sort,setSort]=useState<'bad'|'skip'|'completion'|'dwell'>('bad');
  const itemStats=assessments.map(a=>{const h=assessmentHistory.filter(x=>x.itemId===a.id);const c=h.filter(x=>x.outcome==='correct').length;const w=h.filter(x=>x.outcome==='wrong').length;const skip=h.filter(x=>x.outcome==='skipped').length;const timed=h.filter(x=>x.responseTimeMs);const dist:Record<string,number>={};h.forEach(x=>{if(x.selectedAnswer!==undefined)dist[String(x.selectedAnswer)]=(dist[String(x.selectedAnswer)]??0)+1});return{a,count:h.length,correct:h.length?c/h.length*100:0,wrong:h.length?w/h.length*100:0,skip:h.length?skip/h.length*100:0,avgMs:timed.length?timed.reduce((n,x)=>n+(x.responseTimeMs??0),0)/timed.length:0,dist}}).filter(x=>x.count>0).sort((a,b)=>(b.skip+b.wrong)-(a.skip+a.wrong));
  const lessonRows=lessons.map(l=>{const skill=skills.find(s=>s.id===l.skillId)!;const fb=feedback.filter(f=>f.lessonId===l.id);const lp=lessonProgress[l.id];const dwell=Object.values(lp?.stepTimeSec??{}).reduce((a,n)=>a+n,0);const checkIds=new Set(l.checkpointIds);const attempts=assessmentHistory.filter(a=>checkIds.has(a.itemId));const badCount=fb.filter(f=>f.rating==='bad').length;const commentCount=fb.filter(f=>!!f.comment).length;const skipCount=attempts.filter(a=>a.outcome==='skipped').length;const wrongCount=attempts.filter(a=>a.outcome==='wrong').length;return{l,skill,badRate:fb.length?badCount/fb.length*100:0,comments:commentCount,completion:lp?.completed?100:(lp?.completedStepIds.length??0)/Math.max(1,l.steps.length)*80,skipRate:attempts.length?skipCount/attempts.length*100:0,wrongRate:attempts.length?wrongCount/attempts.length*100:0,dwell,feedbackCount:fb.length}}).filter(x=>domain==='all'||x.skill.domain===domain).sort((a,b)=>sort==='skip'?b.skipRate-a.skipRate:sort==='completion'?a.completion-b.completion:sort==='dwell'?b.dwell-a.dwell:b.badRate-a.badRate);
  const revisionRows=Array.from(new Set(feedback.map(f=>`${f.targetType}:${f.targetId}`))).map(key=>{const [,targetId]=key.split(':');const rows=feedback.filter(f=>f.targetId===targetId);const revisions=Array.from(new Set(rows.map(r=>r.revision))).sort((a,b)=>a-b);return{targetId,revisions,rows}}).filter(x=>x.revisions.length>1);
  const totalStudy=studySessions.reduce((a,s)=>a+s.durationSec,0);
  return <div className="space-y-5"><div className="grid gap-4 sm:grid-cols-4"><Panel className="p-5"><div className="kicker">Feedback</div><div className="metric mt-2 text-4xl font-bold"><Text>{feedback.length}</Text></div><div className="mt-2 text-xs text-[#747d8c]">Good <Text>{good}</Text> · Bad <Text>{bad}</Text></div></Panel><Panel className="p-5"><div className="kicker">Lessons</div><div className="metric mt-2 text-4xl font-bold"><Text>{lessons.length}</Text></div><div className="mt-2 text-xs text-[#747d8c]">revision tracked</div></Panel><Panel className="p-5"><div className="kicker">Assessments</div><div className="metric mt-2 text-4xl font-bold"><Text>{assessments.length}</Text></div><div className="mt-2 text-xs text-[#747d8c]">Recall〜Design</div></Panel><Panel className="p-5"><div className="kicker">Study captured</div><div className="metric mt-2 text-4xl font-bold"><Text>{Math.round(totalStudy/60)}</Text></div><div className="mt-2 text-xs text-[#747d8c]">minutes</div></Panel></div>
    <Panel className="p-5"><div className="kicker">Curriculum coverage</div><p className="mt-2 text-xs leading-6 text-[#657083]"><Text>{"教材構成の充足率です。学習者の習得度や実機技能の認定率ではありません。"}</Text></p><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{coverage.map(c=><div key={c.domain} className="rounded-xl border border-[#e1e4eb] p-4"><div className="flex justify-between"><span className="font-bold"><Text>{domainNames[c.domain as Domain]}</Text></span><span className="metric font-bold"><Text>{c.percent}</Text>%</span></div><div className="mt-3"><Bar value={c.percent}/></div><div className="mt-2 text-[10px] text-[#747d8c]">basic <Text>{c.basic}</Text>/<Text>{c.total}</Text> · full <Text>{c.full}</Text>/<Text>{c.total}</Text></div></div>)}</div></Panel>
    <Panel className="p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><div className="kicker">Content quality dashboard</div><div className="mt-1 text-sm text-[#657083]"><Text>{"Bad / skip / wrong / dwell time / completionを同じ画面で確認。"}</Text></div></div><div className="flex gap-2"><select value={domain} onChange={e=>setDomain(e.target.value as any)} className="rounded-xl border border-[#d9dde5] bg-white px-3 py-2 text-xs"><option value="all">{tr("全分野")}</option>{Object.entries(domainNames).map(([id,n])=><option key={id} value={id}><Text plain>{n}</Text></option>)}</select><select value={sort} onChange={e=>setSort(e.target.value as any)} className="rounded-xl border border-[#d9dde5] bg-white px-3 py-2 text-xs"><option value="bad">{tr("Bad率順")}</option><option value="skip">{tr("Skip率順")}</option><option value="completion">{tr("未完了順")}</option><option value="dwell">{tr("滞在時間順")}</option></select></div></div><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[760px] text-left text-xs"><thead className="text-[#747d8c]"><tr><th className="pb-2">Lesson</th><th>rev</th><th><Text>{"完了"}</Text></th><th>Bad</th><th>comments</th><th>skip</th><th>wrong</th><th>dwell</th></tr></thead><tbody>{lessonRows.map(x=><tr key={x.l.id} className="border-t border-[#eef0f4]"><td className="py-3"><div className="font-bold"><Text>{x.l.title}</Text></div><div className="text-[10px] text-[#a1a8b3]"><Text>{domainNames[x.skill.domain]}</Text></div></td><td><Text>{x.l.revision}</Text></td><td><Text>{Math.round(x.completion)}</Text>%</td><td><Text>{Math.round(x.badRate)}</Text>%</td><td><Text>{x.comments}</Text></td><td><Text>{Math.round(x.skipRate)}</Text>%</td><td><Text>{Math.round(x.wrongRate)}</Text>%</td><td><Text>{Math.round(x.dwell)}</Text>s</td></tr>)}</tbody></table></div></Panel>
    <div className="grid gap-5 xl:grid-cols-2"><Panel className="p-5"><div className="kicker">Missing content</div><div className="mt-3 max-h-[430px] space-y-2 overflow-auto">{skills.map(s=>({s,c:coverageForSkill(s,lessons,assessments)})).filter(x=>!x.c.full).sort((a,b)=>a.c.percent-b.c.percent).slice(0,40).map(({s,c})=><div key={s.id} className="rounded-xl border border-[#e1e4eb] p-3"><div className="flex justify-between"><div className="text-sm font-bold"><Text>{s.nameJa}</Text></div><div className="text-xs font-bold text-[#c83833]"><Text>{c.percent}</Text>%</div></div><div className="mt-1 text-[10px] text-[#747d8c]"><Text>{"不足: "}</Text><Text>{Object.entries(c.has).filter(([,v])=>!v).map(([k])=>k).join(', ')}</Text></div></div>)}</div></Panel><Panel className="p-5"><div className="kicker">Assessment quality</div><div className="mt-3 max-h-[430px] space-y-2 overflow-auto">{itemStats.slice(0,30).map(x=><div key={x.a.id} className="rounded-xl border border-[#e1e4eb] p-3"><div className="flex justify-between"><div className="text-sm font-bold"><Text>{x.a.id}</Text></div><div className="text-[10px] text-[#a1a8b3]">rev.<Text>{x.a.revision}</Text></div></div><div className="mt-1 text-xs text-[#747d8c]">n=<Text>{x.count}</Text> · correct <Text>{Math.round(x.correct)}</Text>% · wrong <Text>{Math.round(x.wrong)}</Text>% · skip <Text>{Math.round(x.skip)}</Text>% · <Text>{x.avgMs?`${(x.avgMs/1000).toFixed(1)}s`:'—'}</Text></div><div className="mt-1 text-[10px] text-[#a1a8b3]">options: <Text>{Object.entries(x.dist).map(([k,v])=>`${k}:${v}`).join(' / ')||'—'}</Text></div></div>)}{!itemStats.length&&<div className="text-sm text-[#747d8c]"><Text>{"回答データが溜まると問題品質を比較できます。"}</Text></div>}</div></Panel></div>
    <Panel className="p-5"><div className="kicker">Revision comparison</div>{revisionRows.length?<div className="mt-3 space-y-2">{revisionRows.map(r=><div key={r.targetId} className="rounded-xl border border-[#e1e4eb] p-3 text-xs"><div className="font-bold"><Text>{r.targetId}</Text></div><div className="mt-1 text-[#657083]">revisions <Text>{r.revisions.join(' → ')}</Text> · feedback <Text>{r.rows.length}</Text></div></div>)}</div>:<div className="mt-3 text-sm text-[#747d8c]"><Text>{"教材revisionが増えると、同じtargetの改善前後をここで比較できます。"}</Text></div>}</Panel>
    <Panel className="p-5"><div className="kicker">Recent feedback</div><div className="mt-3 grid gap-3 md:grid-cols-2">{feedback.slice(0,16).map((f:ContentFeedback)=><div key={f.id} className="rounded-xl border border-[#e1e4eb] p-3"><div className="flex justify-between"><span className={`text-xs font-bold ${f.rating==='bad'?'text-[#c83833]':f.rating==='good'?'text-[#1e7c3c]':'text-[#657083]'}`}><Text>{f.rating??'comment'}</Text> · <Text>{f.targetType}</Text></span><span className="text-[10px] text-[#a1a8b3]">rev.<Text>{f.revision}</Text></span></div><div className="mt-2 text-xs text-[#657083]"><Text>{f.category}</Text></div>{f.comment&&<div className="mt-2 text-sm">{f.comment}</div>}{f.context&&<div className="mt-2 text-[10px] text-[#a1a8b3]"><Text>{f.context.result??''}</Text> <Text>{f.context.timeSpentSec?`· ${f.context.timeSpentSec}s`:''}</Text></div>}</div>)}</div></Panel>
  </div>;
}

function SettingsScreen(){
  const store=useMasteryStore();const[status,setStatus]=useState('');
  const download=async()=>{try{
    const db=await import('@/lib/problem-bank-db');
    const [bankRecords,bankJourney]=await Promise.all([db.loadBankRecords(),db.loadBankJourney()]);
    const data=JSON.stringify({version:5,exportedAt:new Date().toISOString(),states:store.states,evidence:store.evidence,assessmentHistory:store.assessmentHistory,lessonProgress:store.lessonProgress,reviewQueue:store.reviewQueue,studySessions:store.studySessions,activeTimer:store.activeTimer,feedback:store.feedback,practicalSubmissions:store.practicalSubmissions,retrievalAttempts:store.retrievalAttempts,bankRecords:Object.values(bankRecords),bankJourney},null,2);
    const url=URL.createObjectURL(new Blob([data],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='hanabi-study-data-v5.json';a.click();URL.revokeObjectURL(url);setStatus('演習と戻り先を含むデータを書き出しました。');
  }catch{setStatus('書き出せませんでした。ブラウザの保存設定を確認してください。');}};
  const upload=async(file:File)=>{try{
    const data=JSON.parse(await file.text());
    if(!data||typeof data!=='object'||Array.isArray(data))throw new Error('Invalid JSON');
    for(const key of ['assessmentHistory','reviewQueue','studySessions','evidence','feedback','retrievalAttempts'])if(data[key]!==undefined&&!Array.isArray(data[key]))throw new Error('Invalid data');
    const db=await import('@/lib/problem-bank-db');await db.replaceBankSnapshot(data.bankRecords??[],data.bankJourney??null);
    store.importData(data);setStatus('演習と戻り先を含めて読み込みました。旧版データには新しい演習記録は含まれません。');
  }catch(e){setStatus(e instanceof Error?e.message:'読み込めませんでした。');}};
  const resetAll=async()=>{if(!confirm(tr('全ローカル進捗を消しますか？')))return;try{const db=await import('@/lib/problem-bank-db');await db.replaceBankSnapshot([],null);store.reset();setStatus('全進捗をリセットしました。');}catch{setStatus('リセットできませんでした。再試行してください。');}};
  return <div className="grid gap-5 md:grid-cols-2"><Panel className="p-5"><FileJson size={20} className="text-[#0857a2]"/><h2 className="mt-4 font-bold">Export / Import</h2><button onClick={download} className="mt-5 w-full rounded-xl border border-[#c8ced9] p-3 text-sm font-bold"><Text>{"JSONを書き出す"}</Text></button><label className="mt-3 block cursor-pointer rounded-xl border border-[#c8ced9] p-3 text-center text-sm font-bold"><Text>{"JSONを読み込む"}</Text><input type="file" accept="application/json" className="hidden" onChange={e=>e.target.files?.[0]&&upload(e.target.files[0])}/></label>{status&&<div className="mt-3 text-xs text-[#657083]"><Text>{status}</Text></div>}</Panel><Panel className="p-5"><RefreshCcw size={20} className="text-[#c83833]"/><h2 className="mt-4 font-bold">Reset</h2><p className="mt-2 text-sm text-[#657083]"><Text>{"基礎ドリル・戻り先・Lesson・テスト・復習・実践ノート・タイマー・feedbackを初期化。"}</Text></p><button onClick={()=>void resetAll()} className="mt-5 w-full rounded-xl border border-[#efc5c2] bg-[#f9e9e8] p-3 text-sm font-bold text-[#a92d29]"><Text>{"進捗をリセット"}</Text></button></Panel></div>;
}

function Select({children,value,onChange}:{children:React.ReactNode;value:string;onChange:(v:string)=>void}){return <select value={value} onChange={e=>onChange(e.target.value)} className="w-full rounded-xl border border-[#d9dde5] bg-white p-3 text-sm">{children}</select>}
