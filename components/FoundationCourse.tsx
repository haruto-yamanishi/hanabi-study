'use client';
import { MathText } from './MathText';
import { useEffect, useMemo, useRef, useState } from 'react';
import { bankSize, courseGroups, getQuestion, topics, workedExamples, type BankQuestion } from '@/data/foundations';
import { difficultyLabels, questionDifficulty } from '@/data/foundations/difficulty';
import { fmt, type Topic } from '@/data/foundations/types';
import { missingFoundations, needsRemediation, nextBankRecord, parseNumeric, selectBankSet, bankProgress, type BankRecord, type BankRecords } from '@/lib/problem-bank';
import { RecoveryGuide } from './RecoveryGuide';
import { textbookRoutes, topicLevel } from '@/data/foundations/routes';
import { recoveryReadiness, type BankJourney, type BankSession } from '@/lib/remediation';
import { loadBankJourney, saveBankJourney, loadBankRecords, saveBankRecord } from '@/lib/problem-bank-db';

const button='rounded-xl border px-4 py-2 text-sm font-semibold disabled:opacity-40';
const outcomeNames={correct:'自力正答',wrong:'誤答',assisted:'解法を見て正答'};
export function FoundationCourse({initialTopic,onOpenTests}:{initialTopic?:string;onOpenTests?:()=>void}){
  const [records,setRecords]=useState<BankRecords>({});
  const [loaded,setLoaded]=useState(false),[error,setError]=useState('');
  const [selected,setSelected]=useState<string|null>(initialTopic??null),[query,setQuery]=useState(''),[group,setGroup]=useState('all'),[page,setPage]=useState(0);
  const [session,setSession]=useState<BankSession|null>(null);
  const [diagnose,setDiagnose]=useState(false),[journey,setJourney]=useState<BankJourney|null>(null);
  const chooseRecovery=async(id:string,path:string[])=>{const next:BankJourney={originTopicId:journey?.originTopicId??selected!,originQuestionId:journey?journey.originQuestionId:session?.ids[session.index],targetTopicId:id,path:journey?[...journey.path,...path.slice(1)]:path,returnSession:journey?journey.returnSession:session};try{await saveBankJourney(next);setJourney(next);setSelected(id);setSession(null);setDiagnose(false);}catch{setError('戻り先を保存できませんでした。再試行してください。');}};
  const returnToOrigin=async()=>{if(!journey)return;try{await saveBankJourney(null);setSelected(journey.originTopicId);setSession(journey.returnSession);setJourney(null);setDiagnose(false);}catch{setError('復帰を保存できませんでした。');}};
  useEffect(()=>{let active=true;Promise.all([loadBankRecords(),loadBankJourney()]).then(([r,j])=>{if(active){setRecords(r);setJourney(j);if(j&&!initialTopic)setSelected(j.targetTopicId);setLoaded(true);}}).catch(()=>{if(active)setError('演習記録を読み込めません。ブラウザの保存設定を確認して再読み込みしてください。');});return()=>{active=false;};},[]);
  const save=async(record:BankRecord)=>{await saveBankRecord(record);setRecords(r=>({...r,[record.id]:record}));};
  const filtered=topics.filter(t=>(group==='all'||t.group===group)&&`${t.title} ${t.theory}`.includes(query));
  const t=topics.find(t=>t.id===selected);
  const progress=useMemo(()=>bankProgress(records),[records]);
  const attempted=Object.keys(records).length;
  const ready=Object.values(progress).filter(p=>p.ready).length;
  const start=(mode:'practice'|'check'|'review')=>{if(t)setSession({ids:selectBankSet(t,records,mode),mode,index:0});};
  const current=session?getQuestion(session.ids[session.index]??''):undefined;
  if(!loaded)return <section className="panel p-6" role="status">{error||'基礎課程の記録を読み込んでいます…'}</section>;
  return <div className="space-y-5">
    {error&&<p role="alert" className="panel p-4 text-red-700">{error}</p>}
    {journey&&<section className="panel p-5"><h3 className="font-bold">基礎を確認して元の問題へ戻る</h3><p className="mt-2 text-sm leading-7">{journey.path.map(id=>topics.find(t=>t.id===id)?.title).join(' → ')}</p><p className="mt-2 text-sm">{recoveryReadiness(journey.targetTopicId,records)?'基礎ドリルの目安（各問題型2問の自力正答）を満たしました。元の問題を試しましょう。':'各問題型を2問ずつ自力で確認しましょう。必要ならさらに前へ戻れます。'}</p><button className="mt-3 rounded-xl border p-3 text-sm" onClick={()=>void returnToOrigin()}>元の問題・単元に戻る</button></section>}
    <section className="panel p-5"><button className={`${button} mb-4 bg-[#0d1833] text-white`} onClick={onOpenTests}>最初にテストして、できる単元を飛ばす</button><div className="kicker">Foundations → Engineering</div><h2 className="mt-2 text-2xl font-bold">基礎課程と{bankSize.toLocaleString()}問の演習</h2>
      <p className="mt-3 text-sm leading-7">100単元・200問題型の条件違いを含む反復問題です。練習80,000問と初見確認20,000問を分けています。各単元の解説・例題・説明課題は、この問題数へ重複加算していません。</p>
      <p className="mt-2 text-sm leading-7 text-[#657083]">解説→例題→自力演習→修正→時間を空けた復習→初見確認の順で進めます。数値解だけでなく、単位・前提・理由もノートに残してください。</p>
      <div className="mt-4 flex flex-wrap gap-4 text-sm"><span>取り組んだ問題 {attempted.toLocaleString()}/{bankSize.toLocaleString()}</span><span>確認条件を満たす単元 {ready}/100</span></div>
      <details className="mt-3 text-xs leading-6 text-[#657083]"><summary>件数と到達度の意味</summary><div className="mt-3 grid grid-cols-2 gap-2">{Object.entries(courseGroups).map(([id,name])=><p key={id}>{name}：{topics.filter(t=>t.group===id).length}単元・{(topics.filter(t=>t.group===id).length*1000).toLocaleString()}問</p>)}</div><p>同じ問題への再回答は問題数に加算しません。単元の確認条件は、各問題型で確認問題2問の自力正答です。合格したら教材を飛ばせます。誤答した問題型は再確認へ戻り、別問題で回復できます。6時間以上空けた定着確認は別に記録します。解法を見た正答は分けて記録します。これは記録上の目安で、証明力・実機技能・専門課程の修了を認定するものではありません。解析は入門であり、専門分野としての代数幾何学は含みません。</p></details>
    </section>
    {t ? <>
      <button className={button} onClick={()=>{setSelected(null);setSession(null);setDiagnose(false);}}>← 単元一覧へ（保存済みの回答は残ります）</button>
      <section className="panel p-6"><div className="kicker">{courseGroups[t.group]} · {topicLevel(t.id)}</div><h3 className="mt-2 text-xl font-bold">{t.title}</h3>
        {!session&&<><div className="mt-3 flex flex-wrap gap-2">{t.prerequisites.map(id=><button key={id} className={`${button} text-[#0857a2]`} onClick={()=>void chooseRecovery(id,[t.id,id])}>前提：{topics.find(p=>p.id===id)!.title}{progress[id].ready?' ✓':''}</button>)}</div>
          {missingFoundations(t,records).length>0&&<p className="mt-2 text-xs leading-6 text-[#657083]">前提単元の確認はまだ揃っていません。先読み・演習はできます。難しければ上の前提へ戻ってください。</p>}
          <button className={`${button} mt-4 text-[#0857a2]`} onClick={()=>setDiagnose(true)}>わからない・戻り先を診断する</button><h4 className="mt-5 font-bold">考え方と条件</h4><p className="mt-2 whitespace-pre-wrap text-sm leading-8"><MathText>{t.theory}</MathText></p>
          <div className="mt-4 rounded-xl bg-[#fff4dc] p-4 text-sm leading-7"><strong>間違えやすい点：</strong><MathText>{t.pitfall}</MathText></div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">{workedExamples(t).map((ex,i)=><div key={i} className="rounded-xl border p-4"><h4 className="text-sm font-bold">例題：{ex.name}</h4><p className="mt-2 text-sm leading-7"><MathText>{ex.prompt}</MathText></p><p className="mt-3 text-sm leading-7"><MathText>{ex.explanation}</MathText></p><p className="mt-2 font-semibold">答え {fmt(ex.answer)} {ex.unit}</p></div>)}</div>
          <Explanation key={t.id} topic={t}/>
          <div className="mt-5 flex flex-wrap gap-2"><button className={`${button} bg-[#0d1833] text-white`} onClick={()=>start('practice')}>練習10問</button><button className={button} onClick={()=>start('review')}>期限が来た復習</button><button className={button} onClick={()=>start('check')}>初見確認10問</button></div>
          <p className="mt-3 text-xs leading-6 text-[#657083]">各単元800問の練習と200問の初見確認。確認問題は一度でも回答すると復習側へ移ります。全問を解くことより、間違えた理由を直し別条件で説明できることを重視します。</p>
          <div className="mt-3 text-sm">{t.families.map((f,i)=><p key={i}>{f.name}：初見自力正答 {progress[t.id].passed[i]}/2以上 · 遅延復習 {progress[t.id].retained[i]?'確認済み':'未確認'}</p>)}</div>
          <details className="mt-4 text-sm"><summary>直近の回答と修正点</summary><div className="mt-3 space-y-3">{Object.values(records).filter(r=>r.id.startsWith(`bank:${t.id}:`)).sort((a,b)=>b.lastAt-a.lastAt).slice(0,10).map(r=><div key={r.id} className="rounded-xl border p-3"><p><MathText>{getQuestion(r.id)?.prompt}</MathText></p><p className="mt-2">回答：{r.answer} · {outcomeNames[r.lastResult]}</p><p>修正：{r.correction||'未記録'}</p><p className="text-xs text-[#657083]">次回目安：{new Date(r.dueAt).toLocaleString('ja-JP')}</p></div>)}</div></details>
        </>}
      </section>
      {diagnose&&<RecoveryGuide key={t.id} origin={t.id} records={records} save={save} onChoose={(id,path)=>void chooseRecovery(id,path)} onClose={()=>setDiagnose(false)}/>}
      {!diagnose&&session&&(current?<><ProblemTurn key={`${current.id}-${session.index}`} question={current} topic={t} previous={records[current.id]} mode={session.mode} save={save} onStuck={()=>setDiagnose(true)} onNext={retry=>{if(retry&&records[current.id]&&needsRemediation(records[current.id])){setDiagnose(true);return;}setSession(s=>{if(!s)return s;const ids=[...s.ids];if(retry&&s.mode!=='check'&&!ids.slice(s.index+1).includes(current.id))ids.splice(Math.min(s.index+3,ids.length),0,current.id);return {...s,ids,index:s.index+1};});}}/><p className="text-xs text-[#657083]">{session.index+1}/{session.ids.length}問（解き直しを含む）</p><button className={button} onClick={()=>setSession(null)}>ここで終了・解説へ戻る</button></>:<section className="panel p-6"><h4 className="font-bold">{session.ids.length?'このセットは終了しました。':'今の条件に合う問題はありません。'}</h4><p className="mt-2 text-sm leading-7">回答は保存済みです。誤答・解法を見た問題は復習対象になります。初見確認の結果は問題型ごとに確認してください。</p><button className={`${button} mt-4`} onClick={()=>setSession(null)}>単元へ戻る</button></section>)}
    </>:<>
      <section className="panel p-5"><h3 className="font-bold">教科書の学習中に止まったら</h3><p className="mt-2 text-sm leading-7">学年に関係なく、必要なところまで戻れます。各入口から「戻り先を診断する」で前提を確かめてください。</p><div className="mt-3 space-y-3">{textbookRoutes.map(route=><div key={route.name}><p className="text-sm font-semibold">{route.name}</p><div className="mt-2 flex flex-wrap gap-2">{route.ids.map(id=><button key={id} className={button} onClick={()=>setSelected(id)}>{topics.find(t=>t.id===id)!.title}</button>)}</div></div>)}</div><p className="mt-3 text-xs leading-6 text-[#657083]">教科書の問題・解説の転載やページ対応表ではありません。学習分野からHanabi-Study独自の基礎練習へ案内します。</p></section>
      <div className="flex flex-wrap gap-3"><input aria-label="基礎単元を検索" className="min-w-0 flex-1 rounded-xl border p-3 text-sm" value={query} placeholder="単元名・内容を検索" onChange={e=>{setQuery(e.target.value);setPage(0);}}/><select aria-label="基礎課程の分野" className="max-w-full rounded-xl border p-3 text-sm" value={group} onChange={e=>{setGroup(e.target.value);setPage(0);}}><option value="all">全分野</option>{Object.entries(courseGroups).map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></div>
      <div className="grid gap-3 md:grid-cols-2">{filtered.slice(page*10,page*10+10).map(t=><button key={t.id} className={`panel p-5 text-left ${progress[t.id].testPassed?'border-green-500 bg-green-50':progress[t.id].needsReview?'border-amber-400 bg-amber-50':''}`} onClick={()=>{setSelected(t.id);setSession(null);}}><div className="kicker">{courseGroups[t.group]} · {difficultyLabels[questionDifficulty(t.id)]} · 1,000問</div><h3 className="mt-2 font-bold">{t.title}</h3><p className="mt-2 text-xs leading-6 text-[#657083]">{t.families.map(f=>f.name).join(' ／ ')}</p><p className="mt-2 text-xs">回答済み {progress[t.id].attempted} · {progress[t.id].score}% · {progress[t.id].testPassed?'✓ テスト合格・先へ進めます':progress[t.id].needsReview?'再確認が必要':'学習・確認を進める'}</p></button>)}</div>
      {!filtered.length&&<p>該当する単元がありません。</p>}
      <div className="flex items-center gap-3"><button className={button} disabled={page===0} onClick={()=>setPage(p=>p-1)}>前の10単元</button><span className="text-xs">{page+1}/{Math.max(1,Math.ceil(filtered.length/10))}</span><button className={button} disabled={(page+1)*10>=filtered.length} onClick={()=>setPage(p=>p+1)}>次の10単元</button></div>
    </>}
  </div>;
}
function Explanation({topic}:{topic:Topic}){
  const [response,setResponse]=useState(''),[show,setShow]=useState(false);
  return <section className="mt-5 rounded-xl border p-4"><h4 className="font-bold">言葉で説明する</h4><p className="mt-2 text-sm leading-7"><MathText>{topic.explain}</MathText></p><textarea aria-label="基礎単元の説明" rows={3} value={response} onChange={e=>setResponse(e.target.value)} className="mt-3 w-full rounded-xl border p-3 text-sm" placeholder="自分の言葉で説明してから比較（この欄は下書きです）"/><button className={button} disabled={!response.trim()} onClick={()=>setShow(true)}>説明の観点を見る</button>{show&&<p className="mt-3 text-sm leading-7"><MathText>{topic.explainAnswer}</MathText></p>}</section>;
}
function ProblemTurn({question,topic,previous,mode,save,onNext,onStuck}:{question:BankQuestion;topic:Topic;previous?:BankRecord;mode:'practice'|'check'|'review';save:(r:BankRecord)=>Promise<void>;onNext:(retry:boolean)=>void;onStuck:()=>void}){
  const [answer,setAnswer]=useState(''),[correction,setCorrection]=useState(''),[hint,setHint]=useState(false),[result,setResult]=useState<BankRecord|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  const lock=useRef(false);
  const submit=async()=>{
    if(lock.current||result)return;lock.current=true;setBusy(true);setError('');
    try{const r=nextBankRecord(question,previous,{answer,correction:'',usedHint:hint,mode:mode==='check'?'check':'practice',now:Date.now()});await save(r);setResult(r);}catch(e){setError(e instanceof Error?e.message:'保存に失敗しました。再試行してください。');}finally{lock.current=false;setBusy(false);}
  };
  const next=async()=>{if(lock.current||!result)return;lock.current=true;setBusy(true);setError('');try{if(result.lastResult!=='correct'&&!correction.trim())throw new Error('修正点を記入してください。');await save({...result,correction:correction.trim()});onNext(result.lastResult!=='correct');}catch(e){setError(e instanceof Error?e.message:'保存できませんでした。');lock.current=false;setBusy(false);}};
  return <section className="panel p-6"><div className="kicker">{mode==='check'?'初見確認':mode==='review'?'復習':'練習'} · {difficultyLabels[question.difficulty]} · {topic.families[question.family].name}</div><h4 className="mt-3 text-lg font-bold leading-8"><MathText>{question.prompt}</MathText></h4>
    <button className={`${button} mt-3 text-[#0857a2]`} disabled={busy} onClick={onStuck}>わからない・前提からやり直す</button><p className="mt-2 text-xs text-[#657083]">数値・小数・分数（例 1/3）・指数表記で回答。単位は{question.unit||'問題文の指定'}に揃えてください。整数の答えは丸めず、小数は有効数字6桁以上を目安にします。</p>
    <input aria-label="基礎演習の回答" value={answer} disabled={!!result||busy} onChange={e=>setAnswer(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!result&&parseNumeric(answer)!==undefined)void submit();}} className="mt-4 w-full rounded-xl border p-3" placeholder="数値または分数"/>
    {!result?<div className="mt-4 space-y-3"><div className="flex flex-wrap gap-2"><button className={`${button} bg-[#0d1833] text-white`} disabled={busy||parseNumeric(answer)===undefined} onClick={()=>void submit()}>回答を保存して採点</button>{mode!=='check'&&<button className={button} disabled={busy} onClick={()=>setHint(true)}>解法の手掛かりを見る</button>}</div>{hint&&<p className="rounded-xl bg-[#fff4dc] p-4 text-sm leading-7"><MathText>{topic.theory}</MathText><br/>この回答は解法を見た練習として記録します。</p>}</div>:<div className="mt-4 space-y-3"><p className="font-bold">{outcomeNames[result.lastResult]}</p>{needsRemediation(result)&&<p className="text-sm leading-7 text-[#0857a2]">この問題で再び止まっています。修正点を保存したら前提を確認し、分かるところからやり直しましょう。</p>}<p className="text-lg">答え：{fmt(question.answer)} {question.unit}</p><p className="rounded-xl bg-[#e6eff7] p-4 text-sm leading-7"><MathText>{question.explanation}</MathText></p><label className="block text-sm">修正点・次に確認すること{result.lastResult!=='correct'?'（必須）':'（任意）'}<textarea aria-label="基礎演習の修正点" rows={3} maxLength={2000} value={correction} onChange={e=>setCorrection(e.target.value)} className="mt-2 w-full rounded-xl border p-3"/></label><button className={button} disabled={busy||(result.lastResult!=='correct'&&!correction.trim())} onClick={()=>void next()}>{result&&needsRemediation(result)?'修正を保存して前提を確認':'修正を保存して次へ'}</button><p className="text-xs text-[#657083]">正誤と回答は保存済みです。修正点は「次へ」で保存します。自己評価で既存のMaster点数は増えません。</p></div>}
    {error&&<p role="alert" className="mt-3 text-sm text-[#a92d29]">{error}</p>}
  </section>;
}
