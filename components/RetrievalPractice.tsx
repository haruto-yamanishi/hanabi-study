'use client';
import { MathText } from './MathText';

import { useRef, useState } from 'react';
import { retrievalCards, type RetrievalCard } from '@/data/deep';
import { skills, domainNames } from '@/data/curriculum';
import { learningMethodNote, learningMethodSources } from '@/data/learning-method';
import { insertRetry, retrievalProgress } from '@/lib/retrieval';
import { useMasteryStore } from '@/lib/store';
import type { RetrievalAttempt, RetrievalOutcome } from '@/lib/types';

const button = 'rounded-xl border px-4 py-3 text-sm font-semibold disabled:opacity-30';
export function RetrievalPractice({ initialSkill = 'all', onOpenLesson }: { initialSkill?: string; onOpenLesson: (id: string) => void }) {
  const { retrievalAttempts, recordRetrieval } = useMasteryStore();
  const [skill, setSkill] = useState(initialSkill);
  const [filter, setFilter] = useState('due');
  const [queue, setQueue] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [active, setActive] = useState(false);
  const available = retrievalCards.filter(c => {
    const p = retrievalProgress(c.id,c.revision,retrievalAttempts);
    return (skill === 'all' || c.skillId === skill) && (filter === 'all' || (filter === 'missed' ? p.last?.outcome === 'again' : p.due));
  }).sort((a,b) => retrievalProgress(a.id,a.revision,retrievalAttempts).dueAt - retrievalProgress(b.id,b.revision,retrievalAttempts).dueAt);
  const card = retrievalCards.find(c => c.id === queue[index]);
  const record = (attempt: RetrievalAttempt) => {
    recordRetrieval(attempt);
    if (attempt.outcome === 'again') setQueue(q => insertRetry(q,index,attempt.cardId));
    setIndex(i => i + 1);
  };
  return <div className="space-y-5">
    <section className="panel p-6"><h2 className="text-xl font-bold">思い出す → 説明する → 比較する → 解き直す</h2>
      <p className="mt-3 text-sm leading-7">全{retrievalCards.length}題。答えを閉じて理由や手順を書き、解説と比較します。誤答は修正点を残して再出題。速さは記録だけに使い、制限時間は設けません。</p>
      <p className="mt-2 text-xs leading-6 text-[#657083]">{learningMethodNote} 自己評価は習得点に加算しません。6時間以上離れた成功を数え、次回は6時間・1日・3日・7日後を目安にします。</p>
      <div className="mt-3 flex flex-wrap gap-3">{learningMethodSources.map(s => <a key={s.url} href={s.url} target="_blank" rel="noreferrer" className="text-xs text-[#0857a2] underline">{s.title}</a>)}</div>
    </section>
    {active && card ? <><RetrievalTurn key={`${index}-${card.id}`} card={card} onRecord={record}/><button className={button} onClick={() => setActive(false)}>ここで終了（回答記録は保存済み）</button><p className="text-xs text-[#657083]">回答済み {index}件 · 残り {queue.length-index}件（解き直しを含む）</p></> : <>
      {active && <p className="panel p-5 font-semibold">このセットは終了しました。{index}件の回答を保存しました。時間を空けてもう一度説明してみましょう。</p>}
      <section className="panel p-5"><div className="flex flex-wrap gap-3">
        <select aria-label="反復スキル" className="min-w-0 max-w-full rounded-xl border p-3 text-sm" value={skill} onChange={e => setSkill(e.target.value)}><option value="all">全スキル</option>{skills.map(s => <option key={s.id} value={s.id}>{domainNames[s.domain]}・{s.nameJa}</option>)}</select>
        <select aria-label="出題対象" className="rounded-xl border p-3 text-sm" value={filter} onChange={e => setFilter(e.target.value)}><option value="due">未着手・復習時期</option><option value="missed">直近で間違えた問題</option><option value="all">すべて</option></select>
        <button className={`${button} bg-[#0d1833] text-white`} disabled={!available.length} onClick={() => {setQueue(available.slice(0,10).map(c => c.id));setIndex(0);setActive(true);}}>最大10題を始める（対象{available.length}題）</button>
      </div></section>
      <div className="grid gap-3 md:grid-cols-2">{retrievalCards.filter(c => skill === 'all' || c.skillId === skill).map(c => {
        const p = retrievalProgress(c.id,c.revision,retrievalAttempts);
        return <section key={c.id} className="panel p-4"><h3 className="text-sm font-bold"><MathText>{c.prompt}</MathText></h3><p className="mt-2 text-xs text-[#657083]">回答{p.attempts}回 · 間隔を空けた成功 {Math.min(p.passes,3)}/3（自己記録の目安） · {p.due ? '復習できます' : `次回 ${new Date(p.dueAt).toLocaleString('ja-JP')}`}</p><button className="mt-3 text-xs text-[#0857a2]" onClick={() => onOpenLesson(c.lessonId)}>対応する応用教材へ →</button>{p.last && <details className="mt-3 text-xs leading-6"><summary>前回の回答・修正点</summary><p className="whitespace-pre-wrap">{p.last.response}</p><p className="whitespace-pre-wrap">修正：{p.last.correction || 'なし'}</p><p>想起時間 {Math.round(p.last.elapsedSec)}秒 · {p.last.outcome}</p></details>}</section>;
      })}</div>
    </>}
  </div>;
}

function RetrievalTurn({ card, onRecord }: { card: RetrievalCard; onRecord: (attempt: RetrievalAttempt) => void }) {
  const [response,setResponse] = useState('');
  const [correction,setCorrection] = useState('');
  const [revealed,setRevealed] = useState(false);
  const [elapsed,setElapsed] = useState(0);
  const started = useRef(Date.now());
  const submitted = useRef(false);
  const submit = (outcome: RetrievalOutcome) => {
    if(submitted.current || !revealed || !response.trim() || (outcome === 'again' && !correction.trim())) return;
    submitted.current = true;
    onRecord({id:crypto.randomUUID(),cardId:card.id,revision:card.revision,response:response.trim(),correction:correction.trim(),elapsedSec:elapsed,outcome,createdAt:new Date().toISOString()});
  };
  return <section className="panel p-6"><div className="kicker">{skills.find(s => s.id === card.skillId)?.nameJa}</div><h3 className="mt-3 text-lg font-bold leading-8"><MathText>{card.prompt}</MathText></h3>
    <label className="mt-5 block text-sm">答え・手順・理由（思い出せなければ、その旨を書いて進む）<textarea aria-label="自分の説明" value={response} disabled={revealed} onChange={e => setResponse(e.target.value)} rows={5} className="mt-2 w-full rounded-xl border p-3"/></label>
    {!revealed ? <button className={button} disabled={!response.trim()} onClick={() => {setElapsed((Date.now()-started.current)/1000);setRevealed(true);}}>解説と比較する</button> : <div className="mt-4 space-y-4"><div className="whitespace-pre-wrap rounded-xl bg-[#e6eff7] p-4 text-sm leading-7"><MathText>{card.answer}</MathText></div><label className="block text-sm">違った点・次に気をつけること（解き直す場合は必須）<textarea aria-label="修正点" value={correction} onChange={e => setCorrection(e.target.value)} rows={3} className="mt-2 w-full rounded-xl border p-3"/></label><div className="flex flex-wrap gap-2"><button className={button} disabled={!correction.trim()} onClick={() => submit('again')}>まだ説明できない・解き直す</button><button className={button} onClick={() => submit('explained')}>理由まで説明できた</button><button className={button} onClick={() => submit('fluent')}>迷わず説明できた</button></div><p className="text-xs text-[#657083]">解説に理由・前提・手順が一致しているか確認して評価してください。</p></div>}
  </section>;
}
