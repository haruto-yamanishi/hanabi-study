'use client';
import { Text, tr } from './Text';


import { useMemo, useState } from 'react';
import { defaultControlParameters, simulateElevator, type ControlParameters } from '@/lib/control-simulation';

export function ControlLab() {
  const [parameters, setParameters] = useState(defaultControlParameters);
  const samples = useMemo(() => simulateElevator(parameters), [parameters]);
  const maxPosition = Math.max(0.8, ...samples.map(p => p.position)) * 1.1;
  const line = (key: 'position' | 'reference') => samples.map(p => `${50 + p.time / 6 * 550},${210 - p[key] / maxPosition * 180}`).join(' ');
  const peak = Math.max(...samples.map(p => p.position));
  const final = samples[samples.length - 1];
  const saturation = samples.filter(p => Math.abs(p.voltage) >= parameters.voltageLimit - 1e-8).length / 100;
  const stableAtEnd = samples.slice(-51).every(p => Math.abs(p.position - 0.6) <= 0.02);
  const update = (key: keyof ControlParameters, value: number | boolean) => setParameters(p => ({ ...p, [key]: value }));
  const exportCsv = () => {
    const header = `# parameters=${JSON.stringify(parameters)}\ntime_s,position_m,reference_m,voltage_V,integral_m_s\n`;
    const body = samples.map(p => [p.time,p.position,p.reference,p.voltage,p.integral].join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([header + body], { type: 'text/csv' }));
    const a = document.createElement('a'); a.href = url; a.download = 'hanabi-elevator-simulation.csv'; a.click(); URL.revokeObjectURL(url);
  };
  return <section className="mt-5 rounded-2xl border border-[#d9dde5] bg-white p-5">
    <h4 className="font-bold"><Text>{"制御実験室 · Elevator"}</Text></h4>
    <p className="mt-2 text-xs leading-6 text-[#657083]"><Text>{"0→0.6 mの目標を速度0.8 m/s・加速度1 m/s²で生成します。まずFFを切り、次に質量・遅延・ゲインを変えて、誤差と飽和を比較してください。"}</Text></p>
    <div className="mt-4 grid gap-4 sm:grid-cols-2">{[
      ['kp','P [V/m]',0,100,1],['ki','I [V/(m·s)]',0,50,1],['kd','D [V·s/m]',0,30,1],['mass','実際の質量 [kg]',2,8,0.5],['voltageLimit','出力上限 [V]',4,12,0.5],
    ].map(([key,label,min,max,step]) => <label key={key} className="text-xs font-semibold"><Text>{label}</Text>：<Text>{parameters[key as keyof ControlParameters]}</Text><input type="range" aria-label={tr(String(label))} min={Number(min)} max={Number(max)} step={Number(step)} value={Number(parameters[key as keyof ControlParameters])} onChange={e => update(key as keyof ControlParameters, Number(e.target.value))} className="mt-2 w-full"/></label>)}</div>
    <div className="mt-4 flex flex-wrap gap-4 text-xs">{[['feedforward','重力FF（公称4 kg）'],['antiWindup','積分飽和対策'],['delay','観測遅延100 ms']] .map(([key,label]) => <label key={key} className="flex items-center gap-2"><input type="checkbox" checked={Boolean(parameters[key as keyof ControlParameters])} onChange={e => update(key as keyof ControlParameters,e.target.checked)}/><Text>{label}</Text></label>)}</div>
    <svg viewBox="0 0 640 250" role="img" aria-label={tr("6秒間の位置応答。青は実位置、緑の破線は目標位置。")} className="mt-4 w-full">
      <path d="M50 20V210H610" fill="none" stroke="#9ca3af"/>
      <polyline points={line('reference')} fill="none" stroke="#1e7c3c" strokeWidth="2" strokeDasharray="6 4"/>
      <polyline points={line('position')} fill="none" stroke="#0857a2" strokeWidth="2"/>
      <text x="5" y="20" fontSize="12">{tr("位置 m")}</text><text x="5" y="40" fontSize="12"><Text plain>{maxPosition.toFixed(2)}</Text></text><text x="30" y="225" fontSize="12">0</text><text x="555" y="235" fontSize="12">{tr("6秒")}</text>
    </svg>
    <p className="text-xs text-[#657083]"><Text>{"青：実位置 ／ 緑破線：目標"}</Text></p>
    <div className="mt-3 grid gap-2 text-xs sm:grid-cols-3"><p><Text>{"最終誤差："}</Text><Text>{((final.position-0.6)*1000).toFixed(1)}</Text> mm</p><p><Text>{"最大位置："}</Text><Text>{peak.toFixed(3)}</Text> m</p><p><Text>{"飽和時間：約"}</Text><Text>{saturation.toFixed(2)}</Text> s</p></div>
    <p className="mt-3 text-xs"><Text>{"最後の0.5秒が±20 mm以内："}</Text><Text>{stableAtEnd ? 'はい' : 'いいえ'}</Text><Text>{"（制作課題の3秒以内の整定判定はCSVで別途確認）"}</Text></p>
    <div className="mt-4 flex gap-3"><button onClick={exportCsv} className="rounded-lg bg-[#0d1833] px-3 py-2 text-xs font-bold text-white"><Text>{"条件とログをCSV保存"}</Text></button><button onClick={() => setParameters(defaultControlParameters)} className="rounded-lg border px-3 py-2 text-xs"><Text>{"初期条件に戻す"}</Text></button></div>
    <p className="mt-4 text-xs leading-6 text-[#657083]"><Text>{"教育用モデル：m×加速度=8×電圧−3×速度−mg、刻み10 ms、床で停止。モータの電気・熱特性、バックラッシュ、上端衝突を含みません。実機のゲインや安全性を保証するモデルではありません。"}</Text></p>
  </section>;
}
