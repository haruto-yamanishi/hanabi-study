'use client';
import { useState } from 'react';
import { cloze, productionAnswer, type VocabularyEntry } from '../lib/vocabulary';
import type { Answer, WordStatus } from '../lib/learning';

type Phase = 'recognize' | 'meaning' | 'produce' | 'result';
export function StudyCard({ entry, previous, onComplete }: { entry: VocabularyEntry; previous?: WordStatus; onComplete: (answer: Answer) => Promise<void> }) {
  const [phase, setPhase] = useState<Phase>(previous === 'usable' ? 'produce' : 'recognize');
  const [input, setInput] = useState('');
  const [correct, setCorrect] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [meaningKnown, setMeaningKnown] = useState(previous === 'usable');
  const finish = async (answer: Answer) => {
    setBusy(true); setError('');
    try { await onComplete(answer); }
    catch (reason) { setError(reason instanceof Error ? reason.message : '保存できませんでした。もう一度お試しください。'); setBusy(false); }
  };
  const submit = () => {
    if (!input.trim()) return;
    setCorrect(productionAnswer(entry, input));
    setPhase('result');
  };
  const reveal = () => { setRevealed(true); setCorrect(false); setPhase('result'); };
  const answer = entry.answerForm ?? entry.lemma;

  return <article className="study-card" aria-live="polite">
    <div className="card-top"><span>{phase === 'recognize' || phase === 'meaning' ? 'English → 意味' : '意味・文脈 → English'}</span><span>難易度 {entry.difficulty} / 8</span></div>
    {(phase === 'recognize' || phase === 'meaning') && <>
      <div className="word-display">{entry.lemma}</div>
      <div className="word-sub">{entry.pos}</div>
      {phase === 'recognize' ? <><p className="card-help">意味を思い浮かべてから確認してください。</p><button className="primary wide" onClick={() => setPhase('meaning')}>意味を確認</button></> : <>
        <div className="answer-box"><strong>{entry.meaningJa}</strong><span>{entry.definitionEn}</span></div>
        <div className="two-buttons"><button className="secondary" disabled={busy} onClick={() => void finish({ meaningKnown: false, productionCorrect: null })}>× 分からなかった</button><button className="primary" disabled={busy} onClick={() => { setMeaningKnown(true); setPhase('produce'); }}>意味は分かった →</button></div>
      </>}
    </>}
    {phase === 'produce' && <>
      <div className="prompt-label">この意味・文脈に合う英単語を入力</div>
      <div className="meaning-large">{entry.meaningJa}</div>
      <p className="definition">{entry.definitionEn}</p>
      <p className="cloze">{cloze(entry)}</p>
      <form onSubmit={event => { event.preventDefault(); submit(); }}><input autoFocus autoComplete="off" autoCapitalize="off" spellCheck={false} aria-label="英単語を入力" placeholder="English" value={input} onChange={event => setInput(event.target.value)} /><div className="two-buttons"><button type="button" className="secondary" onClick={reveal}>答えを見る</button><button className="primary" disabled={!input.trim()} type="submit">回答する ↵</button></div></form>
    </>}
    {phase === 'result' && <>
      <div className={`result-mark ${correct && !revealed ? 'right' : 'miss'}`}>{correct && !revealed ? '正解' : 'もう一度覚える'}</div>
      <div className="meaning-large">{answer}</div>
      <p className="definition">{entry.meaningJa} · {entry.definitionEn}</p>
      <p className="example">{entry.example}</p>
      {previous === 'usable' && !correct ? <div className="two-buttons"><button className="secondary" disabled={busy} onClick={() => void finish({ meaningKnown: false, productionCorrect: false, revealedAnswer: revealed })}>意味も分からない → ×</button><button className="primary" disabled={busy} onClick={() => void finish({ meaningKnown: true, productionCorrect: false, revealedAnswer: revealed })}>意味は分かる → △</button></div> : <button className="primary wide" disabled={busy} onClick={() => void finish({ meaningKnown, productionCorrect: correct, revealedAnswer: revealed })}>次の語へ →</button>}
    </>}
    {error && <p className="error" role="alert">{error}</p>}
  </article>;
}
