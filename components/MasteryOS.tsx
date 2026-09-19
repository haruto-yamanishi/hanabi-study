'use client';

import { useMemo, useState } from 'react';
import { ReactFlow, Background, Controls, MiniMap, MarkerType, type Node, type Edge } from '@xyflow/react';
import {
  BarChart3,
  BookOpen,
  ChevronRight,
  CircleDot,
  ClipboardCheck,
  Database,
  FileJson,
  GitBranch,
  Home,
  Layers3,
  RefreshCcw,
  Route,
  Search,
  ShieldCheck,
  TimerReset,
  X,
} from 'lucide-react';
import { diagnostics, resources, skills } from '@/data/curriculum';
import { useMasteryStore } from '@/lib/store';
import { defaultState, domainStats, foundationDebt, nextSkills } from '@/lib/mastery';
import { AiUse, Domain, Evidence as EvidenceType, MasteryLevel } from '@/lib/types';

const nav = [
  ['home', 'ホーム', Home],
  ['resources', '教材', BookOpen],
  ['diagnostics', 'テスト', ClipboardCheck],
  ['status', 'ステータス', BarChart3],
  ['roadmap', 'ロードマップ', Route],
  ['map', 'スキルマップ', GitBranch],
  ['today', '今日', TimerReset],
  ['evidence', '記録', ShieldCheck],
  ['settings', 'データ', Database],
] as const;

type Screen = typeof nav[number][0];

const domainNames: Record<Domain, string> = {
  math: 'Math', physics: 'Physics', cs: 'CS', electronics: 'Electronics',
  mechanical: 'Mechanical', control: 'Control', robotics: 'Robotics', ai: 'AI',
};

const levelLabel: Record<MasteryLevel, string> = {
  unassessed: '未評価', exposed: '触れた', assisted: 'AI/資料あり', independent: '自力', transferable: '転用可能',
};

const levelClass: Record<MasteryLevel, string> = {
  unassessed: 'border-[#d9dde5] bg-[#f6f7f9] text-[#747d8c]',
  exposed: 'border-[#c8ced9] bg-[#f0f1f4] text-[#4f5968]',
  assisted: 'border-[#f0d39a] bg-[#fff4dc] text-[#8b5b08]',
  independent: 'border-[#bfd3e5] bg-[#e6eff7] text-[#0857a2]',
  transferable: 'border-[#c2e0cb] bg-[#e6f3ea] text-[#1e7c3c]',
};

function Bar({ value, secondary }: { value: number; secondary?: number }) {
  return <div className="relative h-2 overflow-hidden rounded-full bg-[#e8ebf0]">
    <div className="absolute inset-y-0 left-0 rounded-full bg-[#0857a2]" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    {secondary !== undefined && <div className="absolute inset-y-0 left-0 rounded-full border-r-2 border-[#f5ad34] bg-[#f5ad34]/30" style={{ width: `${Math.max(0, Math.min(100, secondary))}%` }} />}
  </div>;
}

function Pill({ level }: { level: MasteryLevel }) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${levelClass[level]}`}>{levelLabel[level]}</span>;
}

function Panel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`panel ${className}`}>{children}</section>;
}

export default function MasteryOS() {
  const [screen, setScreen] = useState<Screen>('home');
  const { states, evidence, diagnosticHistory } = useMasteryStore();
  const stats = useMemo(() => domainStats(skills, states), [states]);
  const debts = useMemo(() => foundationDebt(skills, states, evidence), [states, evidence]);
  const next = useMemo(() => nextSkills(skills, states), [states]);
  const assessed = skills.filter(s => {
    const st = states[s.id];
    return st && (st.score > 0 || st.assistedScore > 0);
  }).length;
  const answered = diagnosticHistory.length;
  const gap = Math.round(stats.reduce((a, s) => a + s.gap, 0) / stats.length);

  return <div className="min-h-screen lg:grid lg:grid-cols-[252px_1fr]">
    <aside className="border-b border-[#e1e4eb] bg-white p-4 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
      <div className="mb-7 px-2 pt-2">
        <button onClick={() => setScreen('home')} className="flex w-full items-center gap-3 text-left">
          <img src="/brand/FRCHanabi-Symbol-Mark.png" alt="FRC Team 9494 Hanabi" className="h-12 w-12 object-contain" />
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[.16em] text-[#657083]">FRC Team 9494 Hanabi</div>
            <div className="mt-0.5 text-base font-bold text-[#0d1833]">Hanabi Study</div>
          </div>
        </button>
        <div className="hanabi-spectrum mt-4" aria-hidden="true"><span /><span /><span /><span /><span /></div>
      </div>

      <nav className="grid grid-cols-5 gap-1 sm:grid-cols-9 lg:grid-cols-1 lg:gap-1.5">
        {nav.map(([id, label, Icon]) => <button key={id} onClick={() => setScreen(id)} className={`flex items-center justify-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition lg:justify-start lg:text-sm ${screen === id ? 'bg-[#e9edf5] text-[#0d1833]' : 'text-[#657083] hover:bg-[#f8f9fb] hover:text-[#222426]'}`}>
          <Icon size={17} />
          <span className="hidden sm:inline">{label}</span>
        </button>)}
      </nav>

      <div className="mt-8 hidden rounded-xl border border-[#e1e4eb] bg-[#f8f9fb] p-4 lg:block">
        <div className="kicker">Progress</div>
        <div className="mt-2 flex items-baseline justify-between"><span className="text-sm font-bold text-[#0d1833]">{assessed}/{skills.length}</span><span className="text-[11px] text-[#747d8c]">skills</span></div>
        <div className="mt-3"><Bar value={assessed / skills.length * 100} /></div>
      </div>
    </aside>

    <main className="min-w-0 p-4 sm:p-6 lg:p-8">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="kicker">HANABI STUDY</div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#222426]">{nav.find(n => n[0] === screen)?.[1]}</h1>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-[#e1e4eb] bg-white px-3 py-2 text-xs font-semibold text-[#657083]"><CircleDot size={13} className="text-[#1e7c3c]" />Local data</div>
      </header>

      {screen === 'home' && <HomeScreen stats={stats} debts={debts} next={next} gap={gap} assessed={assessed} answered={answered} setScreen={setScreen} />}
      {screen === 'resources' && <Resources />}
      {screen === 'diagnostics' && <Diagnostics />}
      {screen === 'status' && <Status stats={stats} gap={gap} assessed={assessed} />}
      {screen === 'roadmap' && <Roadmap />}
      {screen === 'map' && <SkillMap />}
      {screen === 'today' && <Today />}
      {screen === 'evidence' && <Evidence />}
      {screen === 'settings' && <Settings />}
    </main>
  </div>;
}

function HomeScreen({ stats, debts, next, gap, assessed, answered, setScreen }: {
  stats: ReturnType<typeof domainStats>;
  debts: ReturnType<typeof foundationDebt>;
  next: ReturnType<typeof nextSkills>;
  gap: number;
  assessed: number;
  answered: number;
  setScreen: (screen: Screen) => void;
}) {
  const ready = next.filter(n => n.ready);
  const cards: { title: string; detail: string; meta: string; icon: typeof BookOpen; screen: Screen; color: string }[] = [
    { title: '教材', detail: `${resources.length}件`, meta: '数学・物理・工学・ロボティクス・AI', icon: BookOpen, screen: 'resources', color: '#0857a2' },
    { title: 'テスト', detail: `${answered}/${diagnostics.length}`, meta: answered < diagnostics.length ? 'ベースライン診断' : 'ベースライン完了', icon: ClipboardCheck, screen: 'diagnostics', color: '#c83833' },
    { title: 'ステータス', detail: `${assessed}/${skills.length}`, meta: `AI gap ${gap}`, icon: BarChart3, screen: 'status', color: '#714086' },
    { title: 'ロードマップ', detail: ready[0]?.skill.nameJa ?? '前提を確認', meta: `${ready.length} skills ready`, icon: Route, screen: 'roadmap', color: '#1e7c3c' },
  ];

  return <div className="space-y-5">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ title, detail, meta, icon: Icon, screen, color }) => <button key={title} onClick={() => setScreen(screen)} className="panel group p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex items-center justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${color}12`, color }}><Icon size={20} /></span><ChevronRight size={17} className="text-[#a1a8b3] transition group-hover:translate-x-0.5" /></div>
        <div className="mt-6 text-xs font-bold text-[#657083]">{title}</div>
        <div className="mt-1 truncate text-xl font-bold text-[#222426]">{detail}</div>
        <div className="mt-2 truncate text-xs text-[#747d8c]">{meta}</div>
      </button>)}
    </div>

    <div className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
      <Panel className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4"><div><div className="kicker">Status</div><h2 className="mt-1 font-bold">分野別ステータス</h2></div><button onClick={() => setScreen('status')} className="text-xs font-bold text-[#0857a2]">詳細</button></div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">{stats.map(s => <div key={s.domain} className="rounded-xl border border-[#e1e4eb] bg-[#f8f9fb] p-4">
          <div className="mb-3 flex justify-between"><span className="text-sm font-bold">{domainNames[s.domain as Domain]}</span><span className="metric text-xs text-[#657083]">{Math.round(s.score)} / {Math.round(s.assisted)}</span></div>
          <Bar value={s.score} secondary={s.assisted} />
          <div className="mt-2 text-[11px] text-[#747d8c]">{s.assessed}/{s.total} assessed</div>
        </div>)}</div>
      </Panel>

      <div className="space-y-5">
        <Panel className="p-5"><div className="flex items-center justify-between"><div><div className="kicker">Roadmap</div><h2 className="mt-1 font-bold">次に学べるスキル</h2></div><button onClick={() => setScreen('roadmap')} className="text-xs font-bold text-[#0857a2]">詳細</button></div><div className="mt-4 space-y-3">{ready.slice(0, 4).map(n => <div key={n.skill.id} className="flex items-center gap-3 rounded-xl border border-[#e1e4eb] p-3"><div className="h-2.5 w-2.5 rounded-full bg-[#1e7c3c]" /><div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold">{n.skill.nameJa}</div><div className="truncate text-xs text-[#747d8c]">{domainNames[n.skill.domain]}</div></div></div>)}</div></Panel>
        <Panel className="p-5"><div className="flex items-center gap-2"><Layers3 size={17} className="text-[#f5ad34]" /><div><div className="kicker">Prerequisites</div><h2 className="mt-1 font-bold">前提スキル不足</h2></div></div><div className="mt-4 text-sm text-[#657083]">{debts.length ? `${debts.length}件` : 'なし'}</div></Panel>
      </div>
    </div>
  </div>;
}

function Status({ stats, gap, assessed }: { stats: ReturnType<typeof domainStats>; gap: number; assessed: number }) {
  const { states } = useMasteryStore();
  const counts = (['unassessed', 'exposed', 'assisted', 'independent', 'transferable'] as MasteryLevel[]).map(level => ({ level, count: skills.filter(s => (states[s.id] ?? defaultState()).level === level).length }));
  return <div className="space-y-5">
    <div className="grid gap-4 sm:grid-cols-3">
      <Panel className="p-5"><div className="kicker">Assessed skills</div><div className="metric mt-2 text-4xl font-bold text-[#0d1833]">{assessed}<span className="ml-1 text-sm font-medium text-[#747d8c]">/ {skills.length}</span></div></Panel>
      <Panel className="p-5"><div className="kicker">Independent+</div><div className="metric mt-2 text-4xl font-bold text-[#0857a2]">{counts.filter(x => x.level === 'independent' || x.level === 'transferable').reduce((a, x) => a + x.count, 0)}</div></Panel>
      <Panel className="p-5"><div className="kicker">AI assistance gap</div><div className="metric mt-2 text-4xl font-bold text-[#714086]">{gap}</div></Panel>
    </div>

    <Panel className="p-5 sm:p-6"><div className="kicker">Mastery levels</div><div className="mt-4 grid gap-3 sm:grid-cols-5">{counts.map(x => <div key={x.level} className="rounded-xl border border-[#e1e4eb] bg-[#f8f9fb] p-4"><Pill level={x.level} /><div className="metric mt-4 text-3xl font-bold">{x.count}</div></div>)}</div></Panel>

    <Panel className="p-5 sm:p-6"><div className="kicker">Domains</div><div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(s => <div key={s.domain} className="rounded-xl border border-[#e1e4eb] p-4"><div className="flex items-center justify-between"><span className="font-bold">{domainNames[s.domain as Domain]}</span><span className="text-xs text-[#747d8c]">{s.assessed}/{s.total}</span></div><div className="mt-4"><Bar value={s.score} secondary={s.assisted} /></div><div className="mt-3 flex justify-between text-xs text-[#657083]"><span>Self {Math.round(s.score)}</span><span>Assisted {Math.round(s.assisted)}</span></div></div>)}</div></Panel>
  </div>;
}

function SkillMap() {
  const { states } = useMasteryStore();
  const [selected, setSelected] = useState<string | null>(null);
  const nodes: Node[] = skills.map(s => {
    const st = states[s.id] ?? defaultState();
    return {
      id: s.id,
      position: { x: s.x, y: s.y },
      data: { label: <div className="min-w-[130px]"><div className="text-[10px] font-bold uppercase tracking-wider text-[#747d8c]">{domainNames[s.domain]}</div><div className="mt-1 text-xs font-bold">{s.nameJa}</div><div className="mt-2"><Pill level={st.level} /></div></div> },
      style: { background: '#ffffff', border: selected === s.id ? '2px solid #0857a2' : '1px solid #d9dde5', borderRadius: 10, color: '#222426', padding: 10, width: 165, boxShadow: '0 4px 14px rgba(22,24,29,.05)' },
    };
  });
  const edges: Edge[] = skills.flatMap(s => s.prerequisites.map(p => ({ id: `${p}-${s.id}`, source: p, target: s.id, markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#c8ced9', strokeWidth: 1 } })));
  const sk = skills.find(s => s.id === selected);
  const st = sk ? (states[sk.id] ?? defaultState()) : null;
  return <div className="relative h-[calc(100vh-145px)] min-h-[650px] overflow-hidden rounded-2xl border border-[#e1e4eb] bg-white">
    <ReactFlow nodes={nodes} edges={edges} fitView minZoom={.2} maxZoom={1.8} onNodeClick={(_, n) => setSelected(n.id)}><Background gap={26} size={1} color="#e5e7eb" /><Controls /><MiniMap pannable zoomable nodeColor="#dbe4ef" maskColor="rgba(245,246,249,.74)" /></ReactFlow>
    {sk && st && <div className="absolute right-4 top-4 z-10 w-[min(390px,calc(100%-32px))] rounded-2xl border border-[#d9dde5] bg-white/95 p-5 shadow-xl backdrop-blur"><button onClick={() => setSelected(null)} className="absolute right-3 top-3 text-[#747d8c]"><X size={17} /></button><div className="kicker">{domainNames[sk.domain]}</div><h3 className="mt-1 text-lg font-bold">{sk.nameJa}</h3><div className="mt-1 text-xs text-[#747d8c]">{sk.nameEn}</div><p className="mt-4 text-sm leading-6 text-[#657083]">{sk.description}</p><div className="mt-4 flex items-center justify-between"><Pill level={st.level} /><span className="metric text-sm text-[#657083]">self {st.score} · assisted {st.assistedScore}</span></div><div className="mt-4"><Bar value={st.score} secondary={st.assistedScore} /></div><div className="mt-5 text-xs font-bold text-[#657083]">Prerequisites</div><div className="mt-2 flex flex-wrap gap-2">{sk.prerequisites.length ? sk.prerequisites.map(p => <span key={p} className="rounded-lg border border-[#e1e4eb] bg-[#f8f9fb] px-2 py-1 text-xs text-[#657083]">{skills.find(s => s.id === p)?.nameJa}</span>) : <span className="text-xs text-[#747d8c]">None</span>}</div></div>}
  </div>;
}

function Diagnostics() {
  const { answerDiagnostic, diagnosticHistory, states } = useMasteryStore();
  const answered = new Set(diagnosticHistory.map(h => h.questionId));
  const remaining = diagnostics.filter(q => !answered.has(q.id));
  const q = remaining[0];
  const [choice, setChoice] = useState<number | null>(null);
  const [confidence, setConfidence] = useState(3);
  const [feedback, setFeedback] = useState<string | null>(null);
  const submit = () => {
    if (choice === null || !q) return;
    const correct = choice === q.answer;
    answerDiagnostic(q.skillId, q.id, correct, confidence);
    setFeedback(correct ? 'correct' : 'wrong');
    setTimeout(() => { setChoice(null); setFeedback(null); setConfidence(3); }, 450);
  };
  if (!q) return <Panel className="p-8"><div className="max-w-2xl"><div className="kicker">Baseline complete</div><h2 className="mt-2 text-2xl font-bold">16問完于</h2><div className="mt-6 grid gap-2">{diagnostics.map(d => { const s = skills.find(x => x.id === d.skillId)!; const st = states[s.id] ?? defaultState(); return <div key={d.id} className="flex items-center justify-between rounded-xl border border-[#e1e4eb] p-3 text-sm"><span>{s.nameJa}</span><Pill level={st.level} /></div>; })}</div></div></Panel>;
  const skill = skills.find(s => s.id === q.skillId)!;
  return <div className="grid gap-5 xl:grid-cols-[1fr_310px]">
    <Panel className="p-6 sm:p-8"><div className="flex items-center justify-between"><div><div className="kicker">Baseline · {diagnostics.length - remaining.length + 1}/{diagnostics.length}</div><div className="mt-2 flex items-center gap-2"><span className="text-sm text-[#657083]">Target</span><span className="rounded-full border border-[#d9dde5] bg-[#f8f9fb] px-2 py-1 text-xs font-semibold">{skill.nameJa}</span></div></div><div className="text-4xl font-bold text-[#e1e4eb]">0{q.difficulty}</div></div><h2 className="mt-10 max-w-3xl text-xl font-bold leading-8">{q.prompt}</h2><div className="mt-7 grid gap-3">{q.options.map((o, i) => <button key={o} onClick={() => setChoice(i)} className={`rounded-xl border p-4 text-left text-sm transition ${choice === i ? 'border-[#0857a2] bg-[#e6eff7]' : 'border-[#e1e4eb] bg-white hover:bg-[#f8f9fb]'}`}><span className="mr-3 text-[#747d8c]">{String.fromCharCode(65 + i)}</span>{o}</button>)}</div><div className="mt-8 border-t border-[#e1e4eb] pt-6"><div className="mb-3 flex items-center justify-between text-xs"><span className="text-[#657083]">確信度</span><span>{confidence}/5</span></div><input type="range" min={1} max={5} value={confidence} onChange={e => setConfidence(+e.target.value)} className="w-full" /><button onClick={submit} disabled={choice === null || !!feedback} className="mt-6 w-full rounded-xl bg-[#0d1833] px-4 py-3 text-sm font-bold text-white disabled:opacity-30">{feedback === 'correct' ? 'Correct' : feedback === 'wrong' ? 'Recorded' : '回答を記録'}</button></div></Panel>
    <Panel className="p-5"><div className="kicker">Rules</div><div className="mt-4 space-y-3 text-sm leading-6 text-[#657083]"><p>AI・検索・電卓は使わない。</p><p>確信度も記録する。</p><p>1問の正解だけでは上位レベルにしない。</p></div></Panel>
  </div>;
}

function Roadmap() {
  const { states, evidence } = useMasteryStore();
  const debts = foundationDebt(skills, states, evidence);
  const next = nextSkills(skills, states);
  const current = next.filter(x => x.ready).slice(0, 8);
  const blocked = next.filter(x => !x.ready).slice(0, 8);
  return <div className="grid gap-5 xl:grid-cols-2">
    <Panel className="p-5"><div className="kicker">Ready</div><h2 className="mt-1 font-bold">学習可能</h2><div className="mt-4 space-y-3">{current.map(x => <RoadItem key={x.skill.id} skill={x.skill.nameJa} sub={`${domainNames[x.skill.domain]} · self ${x.state.score}`} ready />)}</div></Panel>
    <Panel className="p-5"><div className="kicker">Blocked</div><h2 className="mt-1 font-bold">前提不足</h2><div className="mt-4 space-y-3">{blocked.map(x => <RoadItem key={x.skill.id} skill={x.skill.nameJa} sub={x.missing.map(id => skills.find(s => s.id === id)?.nameJa).join(' / ')} />)}</div></Panel>
    <Panel className="p-5 xl:col-span-2"><div className="flex items-center gap-2"><Layers3 size={18} className="text-[#f5ad34]" /><div><div className="kicker">Foundation debt</div><h2 className="mt-1 font-bold">前提スキル不足一覧</h2></div></div>{debts.length === 0 ? <div className="mt-5 rounded-xl border border-dashed border-[#d9dde5] p-6 text-sm text-[#657083]">現在はなし</div> : <div className="mt-5 grid gap-3 md:grid-cols-2">{debts.map(d => <div key={d.skill.id} className="rounded-xl border border-[#f0d39a] bg-[#fff4dc] p-4"><div className="font-bold">{d.skill.nameJa}</div><div className="mt-2 text-xs leading-5 text-[#8b5b08]">{d.missing.map(id => skills.find(s => s.id === id)?.nameJa).join(' → ')}</div></div>)}</div>}</Panel>
  </div>;
}

function RoadItem({ skill, sub, ready = false }: { skill: string; sub: string; ready?: boolean }) {
  return <div className="flex items-center gap-3 rounded-xl border border-[#e1e4eb] p-3"><div className={`h-2.5 w-2.5 rounded-full ${ready ? 'bg-[#1e7c3c]' : 'bg-[#c8ced9]'}`} /><div><div className="text-sm font-semibold">{skill}</div><div className="mt-1 text-xs text-[#747d8c]">{sub}</div></div></div>;
}

function Today() {
  const { states } = useMasteryStore();
  const [minutes, setMinutes] = useState(120);
  const next = nextSkills(skills, states);
  const target = next.find(x => x.ready) ?? next[0];
  const learn = Math.max(15, Math.round(minutes * .28));
  const practice = Math.max(20, Math.round(minutes * .45));
  const prove = Math.max(15, minutes - learn - practice);
  return <div className="grid gap-5 xl:grid-cols-[330px_1fr]">
    <Panel className="p-5"><div className="kicker">Available time</div><div className="metric mt-3 text-5xl font-bold text-[#0d1833]">{minutes}<span className="ml-2 text-base font-medium text-[#747d8c]">min</span></div><input className="mt-6 w-full" type="range" min={45} max={240} step={15} value={minutes} onChange={e => setMinutes(+e.target.value)} /></Panel>
    <Panel className="p-5 sm:p-6"><div className="kicker">Session</div><h2 className="mt-2 text-xl font-bold">{target.skill.nameJa}</h2><p className="mt-2 text-sm text-[#657083]">{target.skill.description}</p><div className="mt-7 grid gap-4 md:grid-cols-3"><Session phase="Learn" minutes={learn} text="教材で概念を確認" /><Session phase="Practice" minutes={practice} text="標準問題・小実装" /><Session phase="Check" minutes={prove} text="説明・導出・初見問題" /></div></Panel>
  </div>;
}

function Session({ phase, minutes, text }: { phase: string; minutes: number; text: string }) {
  return <div className="rounded-2xl border border-[#e1e4eb] bg-[#f8f9fb] p-5"><div className="kicker">{phase}</div><div className="metric mt-2 text-3xl font-bold">{minutes}<span className="ml-1 text-xs font-medium text-[#747d8c]">min</span></div><p className="mt-4 text-sm leading-6 text-[#657083]">{text}</p></div>;
}

function Evidence() {
  const { evidence, addEvidence } = useMasteryStore();
  const [skillId, setSkillId] = useState(skills[0].id);
  const [kind, setKind] = useState<EvidenceType['kind']>('implementation');
  const [aiUse, setAiUse] = useState<AiUse>('no-ai');
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [strength, setStrength] = useState(3);
  const save = () => {
    if (!title.trim()) return;
    addEvidence({ id: crypto.randomUUID(), skillId, kind, title: title.trim(), detail: detail.trim(), aiUse, strength, createdAt: new Date().toISOString() });
    setTitle(''); setDetail('');
  };
  return <div className="grid gap-5 xl:grid-cols-[390px_1fr]">
    <Panel className="p-5"><div className="kicker">Add record</div><h2 className="mt-1 font-bold">学習記録を追加</h2><div className="mt-5 space-y-3"><Select value={skillId} onChange={setSkillId}>{skills.map(s => <option key={s.id} value={s.id}>{s.nameJa}</option>)}</Select><Select value={kind} onChange={v => setKind(v as EvidenceType['kind'])}><option value="explanation">説明</option><option value="derivation">導出</option><option value="implementation">ゼロから実装</option><option value="debugging">自力デバッグ</option><option value="transfer">初見への転用</option></Select><Select value={aiUse} onChange={v => setAiUse(v as AiUse)}><option value="no-ai">No AI</option><option value="hint-only">Hint only</option><option value="ai-explanation">AI explanation</option><option value="ai-debugging">AI debugging</option><option value="ai-generated">AI generated</option></Select><input value={title} onChange={e => setTitle(e.target.value)} placeholder="タイトル" className="w-full rounded-xl border border-[#d9dde5] bg-white p-3 text-sm outline-none focus:border-[#0857a2]" /><textarea value={detail} onChange={e => setDetail(e.target.value)} placeholder="メモ" rows={4} className="w-full resize-none rounded-xl border border-[#d9dde5] bg-white p-3 text-sm outline-none focus:border-[#0857a2]" /><div className="flex items-center justify-between text-xs text-[#657083]"><span>Strength</span><span>{strength}/5</span></div><input className="w-full" type="range" min={1} max={5} value={strength} onChange={e => setStrength(+e.target.value)} /><button onClick={save} className="w-full rounded-xl bg-[#0d1833] p-3 text-sm font-bold text-white">記録</button></div></Panel>
    <Panel className="p-5"><div className="kicker">History</div><div className="mt-4 space-y-3">{evidence.length === 0 ? <div className="rounded-xl border border-dashed border-[#d9dde5] p-8 text-center text-sm text-[#747d8c]">記録なし</div> : evidence.map(e => <div key={e.id} className="rounded-xl border border-[#e1e4eb] bg-white p-4"><div className="flex flex-wrap items-start justify-between gap-2"><div><div className="text-sm font-bold">{e.title}</div><div className="mt-1 text-xs text-[#657083]">{skills.find(s => s.id === e.skillId)?.nameJa} · {e.kind}</div></div><span className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${e.aiUse === 'no-ai' || e.aiUse === 'hint-only' ? 'border-[#c2e0cb] bg-[#e6f3ea] text-[#1e7c3c]' : 'border-[#f0d39a] bg-[#fff4dc] text-[#8b5b08]'}`}>{e.aiUse}</span></div>{e.detail && <p className="mt-3 text-xs leading-5 text-[#657083]">{e.detail}</p>}<div className="mt-3 text-[10px] text-[#a1a8b3]">{new Date(e.createdAt).toLocaleString('ja-JP')}</div></div>)}</div></Panel>
  </div>;
}

function Select({ children, value, onChange }: { children: React.ReactNode; value: string; onChange: (v: string) => void }) {
  return <select value={value} onChange={e => onChange(e.target.value)} className="w-full rounded-xl border border-[#d9dde5] bg-white p-3 text-sm outline-none focus:border-[#0857a2]">{children}</select>;
}

function Resources() {
  const [query, setQuery] = useState('');
  const list = resources.filter(r => (r.title + r.provider + r.note).toLowerCase().includes(query.toLowerCase()));
  return <div><div className="mb-5 flex items-center gap-3 rounded-xl border border-[#d9dde5] bg-white px-4"><Search size={16} className="text-[#747d8c]" /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="教材を検索" className="w-full bg-transparent py-3 text-sm outline-none" /></div><div className="grid gap-4 md:grid-cols-2">{list.map(r => <a key={r.id} href={r.url} target="_blank" rel="noreferrer" className="panel block p-5 transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-start justify-between gap-4"><div><div className="kicker">{r.provider}</div><h3 className="mt-1 font-bold">{r.title}</h3></div><ChevronRight size={16} className="text-[#a1a8b3]" /></div><p className="mt-3 text-sm leading-6 text-[#657083]">{r.note}</p><div className="mt-4 flex flex-wrap gap-2">{r.skills.map(id => <span key={id} className="rounded-lg border border-[#e1e4eb] bg-[#f8f9fb] px-2 py-1 text-[10px] text-[#657083]">{skills.find(s => s.id === id)?.nameJa}</span>)}</div></a>)}</div></div>;
}

function Settings() {
  const store = useMasteryStore();
  const [status, setStatus] = useState('');
  const download = () => {
    const data = JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), states: store.states, evidence: store.evidence, diagnosticHistory: store.diagnosticHistory }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'hanabi-study-data.json'; a.click(); URL.revokeObjectURL(url);
  };
  const upload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => { try { store.importData(JSON.parse(String(reader.result))); setStatus('Imported'); } catch { setStatus('Invalid JSON'); } };
    reader.readAsText(file);
  };
  return <div className="grid gap-5 md:grid-cols-2">
    <Panel className="p-5"><FileJson size={20} className="text-[#0857a2]" /><h2 className="mt-4 font-bold">Export / Import</h2><p className="mt-2 text-sm leading-6 text-[#657083]">進捗データをJSONで保存・復元。</p><button onClick={download} className="mt-5 w-full rounded-xl border border-[#c8ced9] bg-white p-3 text-sm font-bold hover:bg-[#f8f9fb]">JSONを書き出す</button><label className="mt-3 block cursor-pointer rounded-xl border border-[#c8ced9] bg-white p-3 text-center text-sm font-bold hover:bg-[#f8f9fb]">JSONを読み込む<input type="file" accept="application/json" className="hidden" onChange={e => e.target.files?.[0] && upload(e.target.files[0])} /></label>{status && <div className="mt-3 text-xs text-[#657083]">{status}</div>}</Panel>
    <Panel className="p-5"><RefreshCcw size={20} className="text-[#c83833]" /><h2 className="mt-4 font-bold">Reset</h2><p className="mt-2 text-sm leading-6 text-[#657083]">診断・学習記録・ステータスを初期化。</p><button onClick={() => { if (confirm('全てのローカル進捗を消しますか？')) store.reset(); }} className="mt-5 w-full rounded-xl border border-[#efc5c2] bg-[#f9e9e8] p-3 text-sm font-bold text-[#a92d29]">進捗をリセット</button></Panel>
  </div>;
}
