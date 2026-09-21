'use client';
import { Text, tr } from './Text';

import { MathText } from './MathText';
import { useState } from 'react';
import { topics } from '@/data/foundations';
import { topicLevel } from '@/data/foundations/routes';
import { advanceDiagnostic, beginDiagnostic, diagnosticQuestion } from '@/lib/remediation';
import { gradeNumeric, nextBankRecord, parseNumeric, type BankRecord, type BankRecords } from '@/lib/problem-bank';
import { fmt } from '@/data/foundations/types';

export function RecoveryGuide({origin,records,save,onChoose,onClose}:{origin:string;records:BankRecords;save:(r:BankRecord)=>Promise<void>;onChoose:(id:string,path:string[])=>void;onClose:()=>void}){
  const [state,setState]=useState(()=>beginDiagnostic(origin));
  const [answer,setAnswer]=useState(''),[result,setResult]=useState<{correct:boolean;answer:number;explanation:string}|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
  // Keep the question stable when saving changes the unseen pool.
  const [probe,setProbe]=useState(()=>diagnosticQuestion(beginDiagnostic(origin),records));
  const submit=async(skip=false)=>{
    if(!probe||busy||result)return;setBusy(true);setError('');
    try{const r=nextBankRecord(probe,records[probe.id],{answer:skip?'わからない':answer,correction:skip?'前提診断：思い出せなかった':'前提診断：解説を確認',usedHint:false,mode:'practice',now:Date.now(),skipped:skip});await save(r);setResult({correct:!skip&&gradeNumeric(probe,answer),answer:probe.answer,explanation:probe.explanation});}catch(e){setError(e instanceof Error?e.message:'診断記録を保存できませんでした。');}finally{setBusy(false);}
  };
  const advance=()=>{if(!result)return;const next=advanceDiagnostic(state,result.correct);setState(next);setProbe(diagnosticQuestion(next,records));setAnswer('');setResult(null);};
  const recommend=topics.find(t=>t.id===state.recommendation);
  return <section className="panel border-2 border-[#0857a2] p-5" aria-label={tr("戻り先の診断")}><div className="flex flex-wrap justify-between gap-3"><h3 className="font-bold"><Text>{"どこからやり直すか確認する"}</Text></h3><button onClick={onClose} className="text-xs underline"><Text>{"診断を閉じる"}</Text></button></div>
    <p className="mt-2 text-xs leading-6 text-[#657083]"><Text>{"前提を1単元ずつ、最大2問で確認します。解けなければさらに前へ戻ります。誤答の原因を断定する診断ではなく、復習先を探す目安です。途中でも下の中学数学からやり直せます。"}</Text></p>
    <p className="mt-3 text-sm"><Text>{state.path.map(id=>topics.find(t=>t.id===id)!.title).join(' → ')}</Text></p>
    {recommend?<div className="mt-4"><p className="font-bold"><Text>{"まず「"}</Text><Text>{recommend.title}</Text><Text>{"」の基礎ドリルへ"}</Text></p><p className="mt-2 text-sm leading-7"><Text>{state.passed.length?'この段階で確認した前提は解けました。':''}</Text><Text>{"解説と例題を読み、各問題型を2問ずつ自力で確認したら元の問題へ戻りましょう。難しければ同じ画面からさらに前提を確認できます。"}</Text></p><button className="mt-4 rounded-xl bg-[#0d1833] px-4 py-3 text-sm text-white" onClick={()=>onChoose(recommend.id,state.path)}><Text>{"この単元でやり直す"}</Text></button></div>:probe&&<div className="mt-4"><div className="text-xs text-[#0857a2]"><Text>{topicLevel(probe.topicId)}</Text> · <Text>{topics.find(t=>t.id===probe.topicId)!.title}</Text> · <Text>{state.probe+1}</Text>/2</div><h4 className="mt-2 font-bold leading-7"><MathText>{probe.prompt}</MathText></h4><input aria-label={tr("前提診断の回答")} value={answer} disabled={busy||!!result} onChange={e=>setAnswer(e.target.value)} className="mt-3 w-full rounded-xl border p-3" placeholder={tr("数値または分数")}/>{!result?<div className="mt-3 flex flex-wrap gap-2"><button disabled={busy||parseNumeric(answer)===undefined} onClick={()=>void submit()} className="rounded-xl border p-3 text-sm disabled:opacity-30"><Text>{"診断の答え合わせ"}</Text></button><button disabled={busy} onClick={()=>void submit(true)} className="rounded-xl border p-3 text-sm"><Text>{"ここもわからない"}</Text></button></div>:<div className="mt-3 rounded-xl bg-[#e6eff7] p-4 text-sm leading-7"><p><Text>{result.correct?'この確認問題は正解です。':'この前提も復習候補です。'}</Text><Text>{" 答え："}</Text><Text>{fmt(result.answer)}</Text></p><p><MathText>{result.explanation}</MathText></p><button onClick={advance} className="mt-3 rounded-xl border bg-white p-3"><Text>{result.correct?'次の前提を確認':'さらに基礎を確認'}</Text></button></div>}</div>}
    <button className="mt-4 text-sm text-[#0857a2] underline" onClick={()=>onChoose('signed',[origin,'signed'])}><Text>{"正負の数・中学数学からやり直す"}</Text></button>
    {error&&<p role="alert" className="mt-3 text-sm text-red-700"><Text>{error}</Text></p>}
  </section>;
}
