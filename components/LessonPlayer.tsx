'use client';
import { MathText } from './MathText';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, ChevronRight, MessageSquare, ThumbsDown, ThumbsUp } from 'lucide-react';
import { ControlLab } from './ControlLab';
import { PracticalNotebook } from './PracticalNotebook';
import { workshopChecks } from '@/lib/graduation';
import { assessments } from '@/data/assessments';
import { resources, skills } from '@/data/curriculum';
import { ContentFeedback, Lesson, LessonStep } from '@/lib/types';
import { useMasteryStore } from '@/lib/store';

const feedbackCategories = [
  '分かりにくい','説明が長い','説明が短すぎる','前提知識が足りない','例が分かりにくい',
  '問題が難しすぎる','問題が簡単すぎる','答え・解説がおかしい','図が欲しい','FRCとのつながりが分からない','誤字・バグ','その他',
];

function InlineFeedback({
  targetType,targetId,lesson,skillId,revision,context,
}:{
  targetType:ContentFeedback['targetType']; targetId:string; lesson:Lesson; skillId:string; revision:number; context?:ContentFeedback['context'];
}){
  const submitFeedback=useMasteryStore(s=>s.submitFeedback);
  const [rating,setRating]=useState<'good'|'bad'|null>(null);
  const [open,setOpen]=useState(false);const[category,setCategory]=useState('');const[comment,setComment]=useState('');const[sent,setSent]=useState(false);
  const send=(nextRating=rating)=>{
    if(sent||(!nextRating&&!comment.trim()))return;
    submitFeedback({id:crypto.randomUUID(),targetType,targetId,lessonId:lesson.id,skillId,rating:nextRating,category:category||undefined,comment:comment.trim()||undefined,revision,context,createdAt:new Date().toISOString()});
    setRating(nextRating);setSent(true);
  };
  return <div className="mt-5 border-t border-[#eef0f4] pt-4">
    <div className="flex flex-wrap items-center gap-2"><span className="mr-1 text-[10px] font-bold text-[#a1a8b3]">この部分</span><button disabled={sent} onClick={()=>{setRating('good');send('good')}} className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-bold ${rating==='good'?'border-[#1e7c3c] bg-[#e6f3ea] text-[#1e7c3c]':'border-[#d9dde5] text-[#657083]'}`}><ThumbsUp size={13}/>Good</button><button disabled={sent} onClick={()=>{setRating('bad');setOpen(true)}} className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-bold ${rating==='bad'?'border-[#c83833] bg-[#f9e9e8] text-[#c83833]':'border-[#d9dde5] text-[#657083]'}`}><ThumbsDown size={13}/>Bad</button><button onClick={()=>setOpen(v=>!v)} className="inline-flex items-center gap-1 rounded-lg border border-[#d9dde5] px-2.5 py-1.5 text-xs font-bold text-[#657083]"><MessageSquare size={13}/>コメント</button>{sent&&<span className="text-[10px] font-bold text-[#1e7c3c]">送信済み</span>}</div>
    {open&&!sent&&<div className="mt-3 rounded-xl bg-[#f8f9fb] p-3"><select value={category} onChange={e=>setCategory(e.target.value)} className="w-full rounded-lg border border-[#d9dde5] bg-white p-2 text-xs"><option value="">カテゴリ（任意）</option>{feedbackCategories.map(c=><option key={c}>{c}</option>)}</select><textarea value={comment} onChange={e=>setComment(e.target.value)} rows={2} placeholder="どこを直すと良さそう？" className="mt-2 w-full resize-none rounded-lg border border-[#d9dde5] p-2 text-xs"/><button onClick={()=>send(rating)} disabled={!rating&&!comment.trim()} className="mt-2 rounded-lg bg-[#0d1833] px-3 py-2 text-xs font-bold text-white disabled:opacity-30">送信</button></div>}
  </div>;
}

export function LessonPlayer({ lesson, onBack, onOpenLesson, onOpenRecall, onOpenFoundation }: { lesson: Lesson; onBack: () => void; onOpenLesson?: (id: string) => void; onOpenRecall?: (id: string) => void; onOpenFoundation?: (skillId:string)=>void }) {
  const { lessonProgress, completeLessonStep, completeLesson, answerAssessment, submitFeedback, feedback } = useMasteryStore();
  const progress = lessonProgress[lesson.id];
  const firstIncomplete = lesson.steps.findIndex(step => !progress?.completedStepIds.includes(step.id));
  const initialIndex = firstIncomplete < 0 ? lesson.steps.length : firstIncomplete;
  const [index, setIndex] = useState(initialIndex);
  const [choice, setChoice] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [stepStartedAt,setStepStartedAt]=useState(Date.now());
  const [checkpointIndex, setCheckpointIndex] = useState(0);
  const [checkpointCorrect, setCheckpointCorrect] = useState(0);
  const [checkpointOutcome,setCheckpointOutcome]=useState<'correct'|'wrong'|'skipped'|null>(null);
  const [checkpointStartedAt,setCheckpointStartedAt]=useState(Date.now());
  const [numeric, setNumeric] = useState('');
  const [rating, setRating] = useState<'good'|'bad'|null>(null);
  const [category, setCategory] = useState('');
  const [comment, setComment] = useState('');
  const [sent, setSent] = useState(false);
  const skill = skills.find(s => s.id === lesson.skillId)!;
  const checkpoint = useMemo(() => lesson.checkpointIds.map(id => assessments.find(a => a.id === id)!).filter(Boolean), [lesson]);
  const refs = (lesson.resourceIds ?? []).map(id => resources.find(r => r.id === id)).filter(Boolean);
  const step = lesson.steps[index];
  const inCheckpoint = index >= lesson.steps.length;
  const item = checkpoint[checkpointIndex];

  useEffect(()=>{setStepStartedAt(Date.now());setChoice(null);setRevealed(false)},[index]);
  useEffect(()=>{setCheckpointStartedAt(Date.now());setCheckpointOutcome(null);setChoice(null);setNumeric('')},[checkpointIndex]);

  const nextStep = () => {
    if (!step) return;
    const elapsed=Math.max(1,Math.round((Date.now()-stepStartedAt)/1000));
    completeLessonStep(lesson.id, step.id, elapsed);
    setIndex(i => i + 1);
  };

  const submitCheckpoint = (skip = false) => {
    if (!item||checkpointOutcome) return;
    let correct = false;
    let selected:number|string|undefined;
    if (!skip) {
      if (item.format === 'mcq') { correct = choice === item.answer; selected=choice??undefined; }
      else { const target = Number(item.answer); const value = Number(numeric); correct = Number.isFinite(value) && Math.abs(value - target) <= (item.tolerance ?? 0); selected=numeric; }
    }
    const outcome=skip?'skipped':correct?'correct':'wrong';
    answerAssessment(item, outcome, 'checkpoint',{selectedAnswer:selected,responseTimeMs:Date.now()-checkpointStartedAt});
    if (correct) setCheckpointCorrect(v => v + 1);
    setCheckpointOutcome(outcome);
  };

  const nextCheckpoint=()=>{
    if(!checkpointOutcome)return;
    if (checkpointIndex + 1 >= checkpoint.length) {
      const totalCorrect = checkpointCorrect;
      completeLesson(lesson.id, checkpoint.length ? Math.round(totalCorrect / checkpoint.length * 100) : 100);
      setCheckpointIndex(checkpoint.length);
    } else setCheckpointIndex(v => v + 1);
  };

  const sendFeedback = () => {
    submitFeedback({id:crypto.randomUUID(), targetType:'lesson', targetId:lesson.id, lessonId:lesson.id, skillId:lesson.skillId,
      rating, category:category||undefined, comment:comment||undefined, revision:lesson.revision, createdAt:new Date().toISOString()});
    setSent(true);
  };

  const finished = inCheckpoint && checkpointIndex >= checkpoint.length;
  const feedbackCount = feedback.filter(f => f.lessonId === lesson.id).length;

  return <div className="mx-auto max-w-4xl space-y-5">
    <button onClick={onBack} className="inline-flex items-center gap-2 text-sm font-semibold text-[#657083] hover:text-[#0d1833]"><ArrowLeft size={16}/>教材一覧</button>
    <div className="panel overflow-hidden">
      <div className="flex flex-wrap gap-3 border-b p-4 text-xs text-[#0857a2]">
<button onClick={()=>onOpenLesson?.(`eng-${lesson.skillId}`)}>基礎教材</button>
<button onClick={()=>onOpenLesson?.(`deep-${lesson.skillId}`)}>応用教材</button>
<button onClick={()=>onOpenFoundation?.(lesson.skillId)}>わからないところを基礎ドリルで確認</button><button onClick={()=>onOpenRecall?.(lesson.skillId)}>説明を反復する →</button>
</div><div className="border-b border-[#e1e4eb] bg-[#f8f9fb] p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4"><div><div className="kicker">{skill.section} · {skill.nameJa}</div><h2 className="mt-2 text-2xl font-bold">{lesson.title}</h2><p className="mt-2 text-sm leading-6 text-[#657083]">{lesson.summary}</p></div><div className="rounded-full border border-[#d9dde5] bg-white px-3 py-1.5 text-xs font-semibold text-[#657083]">{lesson.estimatedMinutes} min · rev.{lesson.revision}</div></div>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#e8ebf0]"><div className="h-full bg-[#0857a2] transition-all" style={{width:`${Math.min(100, ((index + (finished ? 1 : 0))/(lesson.steps.length+1))*100)}%`}}/></div>
      </div>

      <div className="border-b border-[#e1e4eb] p-4">
        {skill.prerequisites.length > 0 && <div className="mb-3 flex flex-wrap items-center gap-2 text-xs"><span className="text-[#657083]">先に学ぶ：</span>{skill.prerequisites.map(id => <button key={id} disabled={!onOpenLesson} onClick={() => onOpenLesson?.(`eng-${id}`)} className="rounded-full border px-3 py-1.5 text-[#0857a2]">{skills.find(s => s.id === id)?.nameJa}</button>)}</div>}
        <div className="flex flex-wrap gap-2">{lesson.steps.map((s, i) => <button key={s.id} onClick={() => setIndex(i)} className={`rounded-lg border px-3 py-2 text-xs ${index === i ? 'border-[#0857a2] bg-[#e6eff7]' : ''}`}>{i+1}. <MathText>{s.title}</MathText></button>)}</div>
      </div>
      {!inCheckpoint && step && <div className="p-6 sm:p-8">
        <div className="text-xs font-bold uppercase tracking-[.14em] text-[#0857a2]">{step.kind}</div><h3 className="mt-2 text-xl font-bold"><MathText>{step.title}</MathText></h3><p className="mt-5 whitespace-pre-line text-[15px] leading-8 text-[#4f5968]"><MathText>{step.body}</MathText></p>
        {step.prompt && <StepExercise key={step.id} step={step} onReveal={() => setRevealed(true)}/>}
        {step.id === 'workshop' && ['c-pid','c-feedforward','c-tuning'].includes(lesson.skillId) && <ControlLab/>}
        {step.id === 'workshop' && lesson.practical && <PracticalNotebook key={lesson.id} id={lesson.id} checks={workshopChecks}/>}
        <InlineFeedback targetType={step.kind==='practice'?'exercise':'step'} targetId={`${lesson.id}:${step.id}`} lesson={lesson} skillId={lesson.skillId} revision={lesson.revision} context={{timeSpentSec:Math.max(1,Math.round((Date.now()-stepStartedAt)/1000))}}/>
        {(!step.prompt || revealed) && <button onClick={nextStep} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0d1833] px-5 py-3 text-sm font-bold text-white">次へ <ChevronRight size={16}/></button>}
      </div>}

      {inCheckpoint && !finished && item && <div className="p-6 sm:p-8">
        <div className="kicker">Closed-book checkpoint · {checkpointIndex+1}/{checkpoint.length}</div><div className="mt-2 text-xs font-semibold text-[#714086]">{item.competency} · Lv.{item.difficulty}</div><h3 className="mt-5 text-xl font-bold leading-8"><MathText>{item.prompt}</MathText></h3>
        {item.format==='mcq'?<div className="mt-6 grid gap-3">{item.options?.map((o,i)=><button key={o} disabled={!!checkpointOutcome} onClick={()=>setChoice(i)} className={`rounded-xl border p-4 text-left text-sm ${choice===i?'border-[#0857a2] bg-[#e6eff7]':'border-[#e1e4eb] bg-white hover:bg-[#f8f9fb]'}`}>{String.fromCharCode(65+i)}. <MathText>{o}</MathText></button>)}</div>:<input disabled={!!checkpointOutcome} value={numeric} onChange={e=>setNumeric(e.target.value)} inputMode="decimal" placeholder="数値を入力" className="mt-6 w-full rounded-xl border border-[#d9dde5] p-4 outline-none focus:border-[#0857a2]"/>}
        {!checkpointOutcome?<div className="mt-6 grid gap-2 sm:grid-cols-2"><button onClick={()=>submitCheckpoint(true)} className="rounded-xl border border-[#d9dde5] bg-white px-4 py-3 text-sm font-bold text-[#657083]">わからない</button><button onClick={()=>submitCheckpoint(false)} disabled={item.format==='mcq'?choice===null:!numeric.trim()} className="rounded-xl bg-[#0d1833] px-4 py-3 text-sm font-bold text-white disabled:opacity-30">回答する</button></div>:<><div className={`mt-5 rounded-xl p-4 text-sm ${checkpointOutcome==='correct'?'bg-[#e6f3ea] text-[#1e7c3c]':'bg-[#fff4dc] text-[#8b5b08]'}`}><div className="font-bold">{checkpointOutcome}</div><div className="mt-1 leading-6"><MathText>{item.explanation}</MathText></div></div><InlineFeedback targetType="checkpoint" targetId={item.id} lesson={lesson} skillId={lesson.skillId} revision={item.revision} context={{result:checkpointOutcome,timeSpentSec:Math.max(1,Math.round((Date.now()-checkpointStartedAt)/1000))}}/><button onClick={nextCheckpoint} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0d1833] px-4 py-3 text-sm font-bold text-white">{checkpointIndex+1>=checkpoint.length?'結果へ':'次の問題'} <ChevronRight size={16}/></button></>}
      </div>}

      {finished && <div className="p-6 sm:p-8"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e6f3ea] text-[#1e7c3c]"><Check/></div><h3 className="mt-4 text-2xl font-bold">Lesson complete</h3><p className="mt-2 text-sm text-[#657083]">Checkpoint {checkpointCorrect}/{checkpoint.length}。読了と実践は別です。復習で時間を空けた再現性を確かめ、実践ノートに成果物を残してください。</p>
        {lesson.practical && <><p className="mt-5 text-sm leading-7"><MathText>{lesson.practical}</MathText></p><PracticalNotebook key={lesson.id} id={lesson.id} checks={workshopChecks}/></>}
        <div className="mt-7 rounded-2xl border border-[#e1e4eb] p-5"><div className="font-bold">この教材どうだった？</div><div className="mt-4 flex gap-2"><button onClick={()=>setRating('good')} className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold ${rating==='good'?'border-[#1e7c3c] bg-[#e6f3ea] text-[#1e7c3c]':'border-[#d9dde5]'}`}><ThumbsUp size={16}/>Good</button><button onClick={()=>setRating('bad')} className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold ${rating==='bad'?'border-[#c83833] bg-[#f9e9e8] text-[#c83833]':'border-[#d9dde5]'}`}><ThumbsDown size={16}/>Bad</button></div><select value={category} onChange={e=>setCategory(e.target.value)} className="mt-4 w-full rounded-xl border border-[#d9dde5] bg-white p-3 text-sm"><option value="">カテゴリ（任意）</option>{feedbackCategories.map(c=><option key={c}>{c}</option>)}</select><textarea value={comment} onChange={e=>setComment(e.target.value)} rows={3} placeholder="コメント（任意）" className="mt-3 w-full resize-none rounded-xl border border-[#d9dde5] p-3 text-sm"/><button onClick={sendFeedback} disabled={sent||(!rating&&!comment.trim())} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#0d1833] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-30"><MessageSquare size={15}/>{sent?'送信済み':'フィードバック'}</button>{feedbackCount>0&&<div className="mt-3 text-xs text-[#747d8c]">このLessonへのローカルfeedback: {feedbackCount}</div>}</div>
        {refs.length>0&&<div className="mt-7"><div className="kicker">Deep dive</div><div className="mt-3 grid gap-2">{refs.map(r=><a key={r!.id} href={r!.url} target="_blank" rel="noreferrer" className="rounded-xl border border-[#d9dde5] p-3 text-sm font-semibold text-[#0857a2]">{r!.provider} · {r!.title}</a>)}</div></div>}
      </div>}
    </div>
  </div>;
}

function StepExercise({ step, onReveal }: { step: LessonStep; onReveal: () => void }) {
  const [choice, setChoice] = useState<number | null>(null);
  const [written, setWritten] = useState('');
  const [revealed, setRevealed] = useState(false);
  const numeric = step.numericAnswer !== undefined;
  const open = !numeric && !step.options;
  const canReveal = step.options ? choice !== null : written.trim().length > 0;
  const correct = numeric
    ? written.trim() !== '' && Number.isFinite(Number(written)) && Math.abs(Number(written) - step.numericAnswer!) <= (step.tolerance ?? 0)
    : choice === step.answer;
  return <div className="mt-7 rounded-2xl border border-[#d9dde5] bg-[#f8f9fb] p-5">
    <div className="font-bold"><MathText>{step.prompt}</MathText></div>
    {step.options ? <div className="mt-4 grid gap-2">{step.options.map((o, i) => <button key={o} disabled={revealed} onClick={() => setChoice(i)} className={`rounded-xl border p-3 text-left text-sm ${choice === i ? 'border-[#0857a2] bg-[#e6eff7]' : 'border-[#d9dde5] bg-white'}`}><MathText>{o}</MathText></button>)}</div>
      : numeric ? <input aria-label="演習の数値回答" disabled={revealed} value={written} onChange={e => setWritten(e.target.value)} inputMode="decimal" placeholder="数値を入力" className="mt-4 w-full rounded-xl border p-3"/>
      : <textarea aria-label="自分の言葉で説明" disabled={revealed} value={written} onChange={e => setWritten(e.target.value)} rows={3} placeholder="判断とその根拠を書いてから解説を開く" className="mt-4 w-full rounded-xl border p-3"/>}
    {!revealed ? <button disabled={!canReveal} onClick={() => { setRevealed(true); onReveal(); }} className="mt-4 rounded-xl bg-[#0d1833] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-30">{open ? '解説と比較する' : '答え合わせ'}</button>
      : <div className="mt-4 rounded-xl bg-white p-4 text-sm leading-7"><div className="font-bold">{open ? '自分の説明と比較（自動採点なし）' : correct ? '正解' : 'もう一度整理'}</div><MathText>{step.explanation}</MathText></div>}
  </div>;
}
