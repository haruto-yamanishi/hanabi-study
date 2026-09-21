'use client';
import { Text, tr } from './Text';


import { useState } from 'react';
import { useMasteryStore } from '@/lib/store';
import { practicalReady } from '@/lib/graduation';
import type { PracticalSubmission } from '@/lib/types';

export function PracticalNotebook({ id, checks, review = false }: {
  id: string; checks: { id: string; text: string }[]; review?: boolean;
}) {
  const stored = useMasteryStore(s => s.practicalSubmissions[id]);
  const save = useMasteryStore(s => s.savePractical);
  const [draft, setDraft] = useState<PracticalSubmission>(stored ?? {
    id, notes: '', checks: [], mode: 'simulation', reviewer: '', updatedAt: '',
  });
  const [saved, setSaved] = useState(false);
  const change = (patch: Partial<PracticalSubmission>) => { setDraft(d => ({ ...d, ...patch })); setSaved(false); };
  const ready = practicalReady(stored, checks.map(c => c.id), review);
  return <div className="mt-5 rounded-2xl border border-[#d9dde5] bg-[#f8f9fb] p-5">
    <h4 className="font-bold"><Text>{"実践ノート "}</Text><span className="text-xs font-normal text-[#657083]"><Text>{ready ? '提出条件の記録あり' : '下書き・検証待ち'}</Text></span></h4>
    <p className="mt-2 text-xs leading-6 text-[#657083]"><Text>{"結果・成果物の保存先・比較した値・失敗と改善を書いてください。記録はこのブラウザに保存され、データ画面から書き出せます。チェックは自己申告で、自動採点や実技認定ではありません。"}</Text></p>
    <label className="mt-4 block text-sm"><Text>{"実施方法"}</Text><select value={draft.mode} onChange={e => change({ mode: e.target.value as PracticalSubmission['mode'] })} className="mt-1 w-full rounded-lg border p-2"><option value="simulation">{tr("机上・コード・シミュレーション")}</option><option value="physical">{tr("実機・製作で検証")}</option></select></label>
    <label className="mt-4 block text-sm"><Text>{"成果物と検証結果（提出条件：40文字以上）"}</Text><textarea value={draft.notes} onChange={e => change({ notes: e.target.value })} rows={6} placeholder={tr("目的と条件：\\n成果物のパス／URL・版：\\n期待値と実測値：\\n失敗・改善・未検証：\\nAIを使った範囲と自分で確認した内容：")} className="mt-1 w-full rounded-lg border p-3 leading-6" /></label>
    <div className="mt-3 space-y-3">{checks.map(c => <label key={c.id} className="flex items-start gap-3 text-sm leading-6"><input type="checkbox" checked={draft.checks.includes(c.id)} onChange={e => change({ checks: e.target.checked ? [...draft.checks, c.id] : draft.checks.filter(x => x !== c.id) })} className="mt-1"/><Text>{c.text}</Text></label>)}</div>
    {review && <label className="mt-4 block text-sm"><Text>{"レビューした人と日付"}</Text><input value={draft.reviewer} onChange={e => change({ reviewer: e.target.value })} placeholder={tr("例：機械担当 山田さん・2026-09-20")} className="mt-1 w-full rounded-lg border p-3"/><span className="mt-1 block text-xs text-[#657083]"><Text>{"本人の認証は行いません。レビューの指摘と対応は検証結果にも残してください。"}</Text></span></label>}
    <button onClick={() => { save({ ...draft, updatedAt: new Date().toISOString() }); setSaved(true); }} className="mt-4 rounded-xl bg-[#0d1833] px-4 py-3 text-sm font-bold text-white"><Text>{"ノートを保存"}</Text></button>
    <span role="status" className="ml-3 text-xs text-[#1e7c3c]"><Text>{saved ? '保存しました' : stored ? '保存済みの記録があります' : '未保存'}</Text></span>
  </div>;
}
