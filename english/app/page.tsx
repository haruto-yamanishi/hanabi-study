'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { StudyCard } from '../components/StudyCard';
import { catalog, catalogById } from '../lib/catalog';
import { dailyGains, dayKey, statusCounts, type Answer, type WordStatus } from '../lib/learning';
import { beginDiagnostic, ensureToday, exportBackup, importBackup, loadSnapshot, recordDailyAnswer, recordDiagnosticAnswer, type Snapshot } from '../lib/storage';
import { useUIStore, type Screen } from '../lib/ui-store';
import { partsOfSpeech, targets, type PartOfSpeech, type Target } from '../lib/vocabulary';

const targetLabel: Record<Target, string> = { eikenPre1: '英検準1級', toefl: 'TOEFL', sat: 'SAT' };
const statusLabel: Record<WordStatus, string> = { unknown: '× 知らない', meaning: '△ 意味は知っている', usable: '○ 使える' };
const screens: { id: Screen; label: string }[] = [{ id: 'home', label: 'Home' }, { id: 'today', label: "Today's 150" }, { id: 'diagnostic', label: 'Initial Test' }, { id: 'vocabulary', label: 'Vocabulary List' }, { id: 'progress', label: 'Progress' }];

export default function Page() {
  const { screen, open } = useUIStore();
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [error, setError] = useState('');
  const refresh = useCallback(async () => { setSnapshot(await loadSnapshot()); }, []);
  useEffect(() => { let live = true; (async () => { try { await ensureToday(catalog); const data = await loadSnapshot(); if (live) setSnapshot(data); } catch (reason) { if (live) setError(reason instanceof Error ? reason.message : '学習記録を読み込めませんでした。'); } })(); return () => { live = false; }; }, []);
  const navigate = (next: Screen) => { open(next); window.scrollTo({ top: 0, behavior: 'instant' }); };
  const counts = snapshot ? statusCounts(snapshot.progress) : { unknown: 0, meaning: 0, usable: 0 };
  const plan = snapshot?.plan;
  const remaining = plan ? plan.ids.length - plan.doneIds.length : 0;
  const nextId = plan?.ids.find(id => !plan.doneIds.includes(id));
  const diagnostic = snapshot?.diagnostic;
  const diagnosticId = diagnostic?.pendingIds[0];
  const dailyAnswer = async (id: string, answer: Answer) => { await recordDailyAnswer(id, answer); await refresh(); };
  const diagnosticAnswer = async (id: string, answer: Answer) => { await recordDiagnosticAnswer(catalog, id, answer); await refresh(); };
  const startTest = async () => { try { await beginDiagnostic(catalog); await refresh(); navigate('diagnostic'); } catch (reason) { setError(reason instanceof Error ? reason.message : '診断を始められませんでした。'); } };

  return <div className="app-shell">
    <header className="site-header"><button className="brand" onClick={() => navigate('home')}><img className="brand-logo" src="/brand/hanabi-normal.png" alt="Hanabi" width="48" height="48" /><span>Hanabi <b>Study English</b><small>EIKEN PRE-1 · TOEFL · SAT</small></span></button><nav aria-label="Main navigation">{screens.map(item => <button key={item.id} className={screen === item.id ? 'active' : ''} onClick={() => navigate(item.id)}>{item.label}</button>)}</nav></header>
    <main>
      {error && <div className="error-banner" role="alert">{error}<button onClick={() => setError('')}>閉じる</button></div>}
      {!snapshot && !error && <div className="loading">学習記録を読み込んでいます…</div>}
      {snapshot && <>
        {screen === 'home' && <section className="home">
          <div className="hero"><div><p className="eyebrow">DAILY VOCABULARY</p><h1>今日の150を<br /><em>始めましょう</em></h1><p className="hero-copy">前回×だった語、△の語、復習期限の語、新しい語の順に出題します。</p><button className="primary hero-button" onClick={() => navigate('today')}>今日の150を始める <span>→</span></button><p className="hero-note">今日の予定 {plan?.ids.length ?? 0}語 · 残り {remaining}語</p></div><div className="hero-number"><span>残り</span><strong>{remaining}</strong><span>語</span></div></div>
          <div className="stats-row"><StatusTile label="× 知らない" count={counts.unknown} tone="red" /><StatusTile label="△ 意味は知っている" count={counts.meaning} tone="amber" /><StatusTile label="○ 使える" count={counts.usable} tone="green" /></div>
          <div className="home-bottom"><div><p className="eyebrow">INITIAL TEST</p><h2>最初の診断</h2><p>短い診断で、学習を始める難易度の目安を決めます。診断を受けずに学習を始めることもできます。</p><button className="text-link" onClick={() => navigate('diagnostic')}>{diagnostic?.finished ? `診断済み · 難易度 ${snapshot.startBand} から` : diagnostic ? '診断を再開する →' : '診断を始める →'}</button></div><div><p className="eyebrow">HOW IT WORKS</p><h2>答え方</h2><p>英語を見て意味を確認し、次に日本語や短い定義から英単語を入力します。</p></div></div>
        </section>}
        {screen === 'today' && <section className="study-page"><PageHeading kicker="TODAY'S 150" title="今日の単語" subtitle={`今日の予定 ${plan?.ids.length ?? 0}語 · 完了 ${plan?.doneIds.length ?? 0}語 · 残り ${remaining}語`} /><div className="progress-track"><span style={{ width: `${plan?.ids.length ? (plan.doneIds.length / plan.ids.length) * 100 : 0}%` }} /></div>{nextId && catalogById.get(nextId) ? <StudyCard key={nextId} entry={catalogById.get(nextId)!} previous={snapshot.progress[nextId]?.status} onComplete={answer => dailyAnswer(nextId, answer)} /> : <div className="finish-card"><div className="finish-icon">✓</div><h2>今日の学習が終わりました</h2><p>{plan?.doneIds.length ?? 0}語を確認しました。</p><div className="gain-row"><div><strong>{plan ? dailyGains(plan, snapshot.progress).unknownToMeaning : 0}</strong><span>× → △以上</span></div><div><strong>{plan ? dailyGains(plan, snapshot.progress).meaningToUsable : 0}</strong><span>△ → ○</span></div></div><button className="primary" onClick={() => navigate('home')}>Homeに戻る</button></div>}</section>}
        {screen === 'diagnostic' && <section className="study-page"><PageHeading kicker="INITIAL TEST" title="今の語彙帯を探す" subtitle="全語を調べず、難易度帯ごとに少数の語を確認します。" />{!diagnostic ? <div className="intro-card"><h2>15〜30分ほどの診断</h2><p>意味を知っている語だけ、英語を自分で入力します。答えを見てから正直に選んでください。途中でやめても、次回ここから続けられます。</p><button className="primary" onClick={() => void startTest()}>診断を始める →</button></div> : diagnostic.finished ? <div className="finish-card"><div className="finish-icon">✓</div><h2>学習開始の目安は難易度 {diagnostic.recommendedBand} / 8</h2><p>{diagnostic.responses.length}語を直接確認しました。その他の語に×△○は付けていません。</p><button className="primary" onClick={() => navigate('today')}>今日の150を始める →</button></div> : diagnosticId && catalogById.get(diagnosticId) ? <><div className="diagnostic-meta"><span>難易度 {diagnostic.band} / 8</span><span>確認済み {diagnostic.responses.length}語</span></div><StudyCard key={diagnosticId} entry={catalogById.get(diagnosticId)!} previous={snapshot.progress[diagnosticId]?.status} source="diagnostic" onComplete={answer => diagnosticAnswer(diagnosticId, answer)} /></> : <div className="intro-card">診断語がありません。<button className="primary" onClick={() => void startTest()}>やり直す</button></div>}</section>}
        {screen === 'vocabulary' && <VocabularyList progress={snapshot.progress} />}
        {screen === 'progress' && <ProgressScreen snapshot={snapshot} counts={counts} onRefresh={refresh} />}
      </>}
    </main><footer>Hanabi Study English · 学習記録はこのブラウザに保存されます。</footer>
  </div>;
}

function PageHeading({ kicker, title, subtitle }: { kicker: string; title: string; subtitle: string }) { return <div className="page-heading"><p className="eyebrow">{kicker}</p><h1>{title}</h1><p>{subtitle}</p></div>; }
function StatusTile({ label, count, tone }: { label: string; count: number; tone: string }) { return <div className={`status-tile ${tone}`}><span>{label}</span><strong>{count}</strong><small>語</small></div>; }

function VocabularyList({ progress }: { progress: Snapshot['progress'] }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<WordStatus | ''>('');
  const [pos, setPos] = useState<PartOfSpeech | ''>('');
  const [difficulty, setDifficulty] = useState('');
  const [target, setTarget] = useState<Target | ''>('');
  const [limit, setLimit] = useState(60);
  const rows = useMemo(() => catalog.filter(entry => {
    const search = query.trim().toLowerCase();
    return (!search || `${entry.lemma} ${entry.meaningJa} ${entry.definitionEn}`.toLowerCase().includes(search)) && (!status || progress[entry.id]?.status === status) && (!pos || entry.pos === pos) && (!difficulty || entry.difficulty === Number(difficulty)) && (!target || !!entry.targets[target]);
  }), [query, status, pos, difficulty, target, progress]);
  return <section className="list-page"><PageHeading kicker="VOCABULARY LIST" title="単語一覧" subtitle={`${rows.length}語 · 記号のない語はまだ確認していません。`} /><div className="filters"><input aria-label="単語を検索" placeholder="英語・日本語・定義で検索" value={query} onChange={event => { setQuery(event.target.value); setLimit(60); }} /><select aria-label="状態" value={status} onChange={event => { setStatus(event.target.value as WordStatus | ''); setLimit(60); }}><option value="">状態：すべて</option><option value="unknown">× 知らない</option><option value="meaning">△ 意味は知っている</option><option value="usable">○ 使える</option></select><select aria-label="品詞" value={pos} onChange={event => { setPos(event.target.value as PartOfSpeech | ''); setLimit(60); }}><option value="">品詞：すべて</option>{partsOfSpeech.map(item => <option key={item} value={item}>{item}</option>)}</select><select aria-label="難易度" value={difficulty} onChange={event => { setDifficulty(event.target.value); setLimit(60); }}><option value="">難易度：すべて</option>{Array.from({ length: 8 }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}</select><select aria-label="target" value={target} onChange={event => { setTarget(event.target.value as Target | ''); setLimit(60); }}><option value="">目標：すべて</option>{targets.map(item => <option key={item} value={item}>{targetLabel[item]}</option>)}</select></div><div className="vocab-table">{rows.slice(0, limit).map(entry => <div className="vocab-row" key={entry.id}><span className={`state-symbol ${progress[entry.id]?.status ?? ''}`}>{progress[entry.id]?.status === 'unknown' ? '×' : progress[entry.id]?.status === 'meaning' ? '△' : progress[entry.id]?.status === 'usable' ? '○' : ''}</span><div><strong>{entry.lemma}</strong><small>{entry.pos} · 難易度 {entry.difficulty}</small></div><span className="row-meaning">{entry.meaningJa}</span><span className="row-targets">{targets.filter(item => entry.targets[item]).map(item => targetLabel[item]).join(' · ')}</span></div>)}{rows.length === 0 && <p className="empty">該当する語がありません。</p>}</div>{rows.length > limit && <button className="more-button" onClick={() => setLimit(limit + 60)}>さらに表示</button>}</section>;
}

function ProgressScreen({ snapshot, counts, onRefresh }: { snapshot: Snapshot; counts: ReturnType<typeof statusCounts>; onRefresh: () => Promise<void> }) {
  const [message, setMessage] = useState('');
  const today = snapshot.plan?.doneIds.length ?? 0;
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400_000).toISOString();
  const gainedUsable = new Set(snapshot.recentAttempts.filter(attempt => attempt.at >= sevenDaysAgo && attempt.after === 'usable' && attempt.before !== 'usable').map(attempt => attempt.wordId)).size;
  const download = async () => { try { const content = await exportBackup(); const url = URL.createObjectURL(new Blob([content], { type: 'application/json' })); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `hanabi-english-${dayKey(new Date())}.json`; anchor.click(); URL.revokeObjectURL(url); setMessage('バックアップを書き出しました。'); } catch (error) { setMessage(error instanceof Error ? error.message : '書き出しに失敗しました。'); } };
  const upload = async (file: File) => { try { await importBackup(await file.text(), new Set(catalog.map(entry => entry.id))); await onRefresh(); setMessage('バックアップを読み込みました。'); } catch (error) { setMessage(error instanceof Error ? error.message : '読み込みに失敗しました。'); } };
  return <section className="progress-page"><PageHeading kicker="PROGRESS" title="進み具合" subtitle="覚える語を減らし、使える語を増やしていきます。" /><div className="stats-row"><StatusTile label="× 知らない" count={counts.unknown} tone="red" /><StatusTile label="△ 意味は知っている" count={counts.meaning} tone="amber" /><StatusTile label="○ 使える" count={counts.usable} tone="green" /></div><div className="progress-grid"><div className="plain-card"><p className="eyebrow">RECENT</p><div className="mini-stat"><strong>{today}</strong><span>今日学習した語</span></div><div className="mini-stat"><strong>+{gainedUsable}</strong><span>直近7日で○になった語</span></div></div><div className="plain-card"><p className="eyebrow">TARGETS</p>{targets.map(target => { const words = catalog.filter(entry => entry.targets[target]); const known = words.filter(entry => snapshot.progress[entry.id]?.status === 'usable').length; const checked = words.filter(entry => snapshot.progress[entry.id]).length; return <div className="target-row" key={target}><span>{targetLabel[target]}</span><strong>○ {known} / 確認 {checked} / 収録 {words.length}</strong></div>; })}<small>対策上の有用度による集計です。試験の公式語彙数や到達判定ではありません。</small></div></div><div className="plain-card backup"><div><p className="eyebrow">LOCAL DATA</p><h2>バックアップ</h2><p>学習履歴はこのブラウザに保存されます。定期的にJSONを書き出してください。</p></div><div className="backup-actions"><button className="secondary" onClick={() => void download()}>JSONを書き出す</button><label className="secondary file-button">JSONを読み込む<input type="file" accept="application/json,.json" onChange={event => { const file = event.target.files?.[0]; if (file) void upload(file); event.target.value = ''; }} /></label></div>{message && <p role="status">{message}</p>}</div></section>;
}
