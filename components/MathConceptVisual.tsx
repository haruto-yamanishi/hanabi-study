'use client';

import { useId, useMemo, useState } from 'react';

type Vec = { x: number; y: number };
type Mode = 'dot' | 'cross';

const ORIGIN = { x: 320, y: 205 };
const SCALE = 42;
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const magnitude = (v: Vec) => Math.hypot(v.x, v.y);
const dot = (a: Vec, b: Vec) => a.x * b.x + a.y * b.y;
const cross = (a: Vec, b: Vec) => a.x * b.y - a.y * b.x;
const toScreen = (v: Vec) => ({ x: ORIGIN.x + v.x * SCALE, y: ORIGIN.y - v.y * SCALE });
const fmt = (value: number) => Math.abs(value) < 0.005 ? '0.00' : value.toFixed(2);

export function MathConceptVisual({ skillId }: { skillId: string }) {
  if (skillId !== 'm-vectors') return null;
  return <VectorProductVisualizer />;
}

function VectorProductVisualizer() {
  const uid = useId().replace(/:/g, '');
  const markerA = 'vector-a-' + uid;
  const markerB = 'vector-b-' + uid;
  const markerProjection = 'vector-projection-' + uid;
  const [mode, setMode] = useState<Mode>('dot');
  const [a, setA] = useState<Vec>({ x: 4, y: 1 });
  const [b, setB] = useState<Vec>({ x: 2, y: 3 });
  const [dragging, setDragging] = useState<'a' | 'b' | null>(null);

  const aScreen = toScreen(a);
  const bScreen = toScreen(b);
  const dotValue = dot(a, b);
  const crossValue = cross(a, b);
  const angle = useMemo(() => {
    const denominator = magnitude(a) * magnitude(b);
    if (denominator < 1e-9) return 0;
    return Math.acos(clamp(dotValue / denominator, -1, 1)) * 180 / Math.PI;
  }, [a, b, dotValue]);

  const projection = useMemo(() => {
    const aa = dot(a, a);
    if (aa < 1e-9) return { x: 0, y: 0 };
    const ratio = dotValue / aa;
    return { x: a.x * ratio, y: a.y * ratio };
  }, [a, dotValue]);

  const projectionScreen = toScreen(projection);
  const sumScreen = toScreen({ x: a.x + b.x, y: a.y + b.y });

  const updateVector = (which: 'a' | 'b', axis: 'x' | 'y', raw: string) => {
    const value = Number(raw);
    if (!Number.isFinite(value)) return;
    const setter = which === 'a' ? setA : setB;
    setter(current => ({ ...current, [axis]: clamp(value, -5, 5) }));
  };

  const pointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 640;
    const y = ((event.clientY - rect.top) / rect.height) * 410;
    const next = {
      x: clamp((x - ORIGIN.x) / SCALE, -5, 5),
      y: clamp((ORIGIN.y - y) / SCALE, -4.4, 4.4),
    };
    (dragging === 'a' ? setA : setB)(next);
  };

  const reset = () => {
    setA({ x: 4, y: 1 });
    setB({ x: 2, y: 3 });
  };

  const meaning = mode === 'dot'
    ? Math.abs(dotValue) < 0.02
      ? 'ほぼ直角。相手方向への成分がほぼないので、内積は 0 に近づく。'
      : dotValue > 0
        ? '同じ向きの成分がある。b の「a 方向への影」が a と同じ側なので内積は正。'
        : '反対向きの成分が強い。b の「a 方向への影」が a と逆側なので内積は負。'
    : Math.abs(crossValue) < 0.02
      ? '2本がほぼ平行なので、張る平行四辺形の面積は 0 に近づく。'
      : crossValue > 0
        ? '平行四辺形の面積が外積の大きさ。a から b への回転は反時計回りなので +z。'
        : '平行四辺形の面積が外積の大きさ。a から b への回転は時計回りなので -z。';

  const gridX = Array.from({ length: 15 }, (_, i) => 26 + i * 42);
  const gridY = Array.from({ length: 10 }, (_, i) => 16 + i * 42);

  return (
    <div className="mt-7 overflow-hidden rounded-2xl border border-[#d9dde5] bg-[#fbfcfe]">
      <div className="border-b border-[#e5e8ee] p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[.16em] text-[#0857a2]">Interactive visual</div>
            <h4 className="mt-1 text-base font-bold text-[#0d1833]">内積と外積を、計算より先に目でつかむ</h4>
            <p className="mt-1 text-xs leading-5 text-[#657083]">矢印の先端をドラッグ。数値入力でも動かせます。</p>
          </div>
          <button type="button" onClick={reset} className="rounded-lg border border-[#d9dde5] bg-white px-3 py-2 text-xs font-bold text-[#657083]">リセット</button>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setMode('dot')} aria-pressed={mode === 'dot'} className={'rounded-xl border px-4 py-3 text-left text-sm font-bold ' + (mode === 'dot' ? 'border-[#0857a2] bg-[#e6eff7] text-[#0857a2]' : 'border-[#d9dde5] bg-white text-[#657083]')}>
            内積 <span className="font-mono font-normal">a · b</span>
          </button>
          <button type="button" onClick={() => setMode('cross')} aria-pressed={mode === 'cross'} className={'rounded-xl border px-4 py-3 text-left text-sm font-bold ' + (mode === 'cross' ? 'border-[#0857a2] bg-[#e6eff7] text-[#0857a2]' : 'border-[#d9dde5] bg-white text-[#657083]')}>
            外積 <span className="font-mono font-normal">a × b</span>
          </button>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[minmax(0,1.45fr)_minmax(250px,.8fr)]">
        <div className="min-w-0 p-3 sm:p-5">
          <svg
            viewBox="0 0 640 410"
            className="block h-auto w-full touch-none rounded-xl bg-white"
            role="img"
            aria-label="2本のベクトルを動かして内積と外積を確認する図"
            onPointerMove={pointerMove}
            onPointerUp={() => setDragging(null)}
            onPointerCancel={() => setDragging(null)}
          >
            <defs>
              <marker id={markerA} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#086f83" /></marker>
              <marker id={markerB} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#a5521f" /></marker>
              <marker id={markerProjection} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#714086" /></marker>
            </defs>

            {gridX.map(x => <line key={'gx-' + x} x1={x} y1="0" x2={x} y2="410" stroke="#eef0f4" />)}
            {gridY.map(y => <line key={'gy-' + y} x1="0" y1={y} x2="640" y2={y} stroke="#eef0f4" />)}
            <line x1="0" y1={ORIGIN.y} x2="640" y2={ORIGIN.y} stroke="#aeb5c0" strokeWidth="1.5" />
            <line x1={ORIGIN.x} y1="0" x2={ORIGIN.x} y2="410" stroke="#aeb5c0" strokeWidth="1.5" />

            {mode === 'dot' ? (
              <>
                <line x1={bScreen.x} y1={bScreen.y} x2={projectionScreen.x} y2={projectionScreen.y} stroke="#714086" strokeWidth="2" strokeDasharray="6 5" />
                <line x1={ORIGIN.x} y1={ORIGIN.y} x2={projectionScreen.x} y2={projectionScreen.y} stroke="#714086" strokeWidth="6" strokeLinecap="round" markerEnd={'url(#' + markerProjection + ')'} />
                <text x={(ORIGIN.x + projectionScreen.x) / 2 + 8} y={(ORIGIN.y + projectionScreen.y) / 2 - 10} fill="#714086" fontSize="13" fontWeight="700">projection</text>
              </>
            ) : (
              <>
                <polygon points={[ORIGIN.x + ',' + ORIGIN.y, aScreen.x + ',' + aScreen.y, sumScreen.x + ',' + sumScreen.y, bScreen.x + ',' + bScreen.y].join(' ')} fill="#714086" fillOpacity=".14" stroke="#714086" strokeWidth="2" strokeDasharray="5 4" />
                <circle cx="410" cy="322" r="22" fill="white" stroke="#714086" strokeWidth="2" />
                {Math.abs(crossValue) < 0.02
                  ? <text x="410" y="327" textAnchor="middle" fill="#657083" fontSize="14">0</text>
                  : crossValue > 0
                    ? <circle cx="410" cy="322" r="5" fill="#714086" />
                    : <><line x1="403" y1="315" x2="417" y2="329" stroke="#714086" strokeWidth="3" /><line x1="417" y1="315" x2="403" y2="329" stroke="#714086" strokeWidth="3" /></>}
                <text x="440" y="327" fill="#657083" fontSize="13">{crossValue > 0 ? '+z 手前' : crossValue < 0 ? '-z 奥' : '向きなし'}</text>
              </>
            )}

            <line x1={ORIGIN.x} y1={ORIGIN.y} x2={aScreen.x} y2={aScreen.y} stroke="#086f83" strokeWidth="5" strokeLinecap="round" markerEnd={'url(#' + markerA + ')'} />
            <line x1={ORIGIN.x} y1={ORIGIN.y} x2={bScreen.x} y2={bScreen.y} stroke="#a5521f" strokeWidth="5" strokeLinecap="round" markerEnd={'url(#' + markerB + ')'} />
            <circle cx={aScreen.x} cy={aScreen.y} r="18" fill="transparent" className="cursor-grab" onPointerDown={event => { event.currentTarget.setPointerCapture(event.pointerId); setDragging('a'); }} />
            <circle cx={bScreen.x} cy={bScreen.y} r="18" fill="transparent" className="cursor-grab" onPointerDown={event => { event.currentTarget.setPointerCapture(event.pointerId); setDragging('b'); }} />
            <text x={aScreen.x + 12} y={aScreen.y - 10} fill="#086f83" fontSize="18" fontWeight="700">a</text>
            <text x={bScreen.x + 12} y={bScreen.y - 10} fill="#a5521f" fontSize="18" fontWeight="700">b</text>
          </svg>

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#657083]">
            <span><span className="font-bold text-[#086f83]">a</span> = ({fmt(a.x)}, {fmt(a.y)})</span>
            <span><span className="font-bold text-[#a5521f]">b</span> = ({fmt(b.x)}, {fmt(b.y)})</span>
            <span>θ = {angle.toFixed(1)}°</span>
          </div>
        </div>

        <div className="min-w-0 border-t border-[#e5e8ee] p-4 sm:p-5 lg:border-l lg:border-t-0">
          <div className="text-xs font-bold text-[#657083]">いまの結果</div>
          <div className="mt-1 text-2xl font-bold tracking-tight text-[#0d1833]">
            {mode === 'dot' ? 'a · b = ' + fmt(dotValue) : 'a × b = ' + fmt(crossValue) + ' k'}
          </div>
          <p className="mt-2 text-sm leading-6 text-[#4f5968]">{meaning}</p>

          <div className="mt-5 rounded-xl bg-white p-3">
            <div className="grid grid-cols-[auto_1fr_1fr] items-center gap-2 text-xs">
              <span />
              <span className="text-center text-[#657083]">x</span>
              <span className="text-center text-[#657083]">y</span>
              <span className="font-bold text-[#086f83]">a</span>
              <input aria-label="ベクトルaのx成分" type="number" min="-5" max="5" step="0.1" value={Number(a.x.toFixed(2))} onChange={e => updateVector('a', 'x', e.target.value)} className="min-w-0 rounded-lg border border-[#d9dde5] px-2 py-2 text-center text-sm" />
              <input aria-label="ベクトルaのy成分" type="number" min="-5" max="5" step="0.1" value={Number(a.y.toFixed(2))} onChange={e => updateVector('a', 'y', e.target.value)} className="min-w-0 rounded-lg border border-[#d9dde5] px-2 py-2 text-center text-sm" />
              <span className="font-bold text-[#a5521f]">b</span>
              <input aria-label="ベクトルbのx成分" type="number" min="-5" max="5" step="0.1" value={Number(b.x.toFixed(2))} onChange={e => updateVector('b', 'x', e.target.value)} className="min-w-0 rounded-lg border border-[#d9dde5] px-2 py-2 text-center text-sm" />
              <input aria-label="ベクトルbのy成分" type="number" min="-5" max="5" step="0.1" value={Number(b.y.toFixed(2))} onChange={e => updateVector('b', 'y', e.target.value)} className="min-w-0 rounded-lg border border-[#d9dde5] px-2 py-2 text-center text-sm" />
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-[#e5e8ee] bg-white p-3 text-xs leading-6 text-[#4f5968]">
            {mode === 'dot'
              ? <><div className="font-mono">a · b = aₓbₓ + aᵧbᵧ</div><div className="mt-1">「同じ方向を向いている量」を、b の影として見る。</div></>
              : <><div className="font-mono">a × b = (aₓbᵧ − aᵧbₓ) k</div><div className="mt-1">大きさは2本が張る面積、符号は面に垂直な向き。</div></>}
          </div>
        </div>
      </div>
    </div>
  );
}
