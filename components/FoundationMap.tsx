'use client';
import { useEffect, useMemo, useState } from 'react';
import { Background, Controls, MiniMap, ReactFlow, type Node, type Edge } from '@xyflow/react';
import { topics, courseGroups } from '@/data/foundations';
import { bankProgress, type BankRecords } from '@/lib/problem-bank';
import { loadBankRecords } from '@/lib/problem-bank-db';
import { Text } from './Text';

export function FoundationMap({onOpen}:{onOpen:(id:string)=>void}){
  const [records,setRecords]=useState<BankRecords>({});
  const [loaded,setLoaded]=useState(false),[error,setError]=useState(false);
  useEffect(()=>{let active=true;const refresh=()=>{void loadBankRecords().then(rows=>{if(active){setRecords(rows);setLoaded(true);setError(false);}}).catch(()=>{if(active)setError(true);});};refresh();window.addEventListener('focus',refresh);return()=>{active=false;window.removeEventListener('focus',refresh);};},[]);
  const progress=useMemo(()=>bankProgress(records),[records]);
  const nodes=useMemo(()=>{
    const depths=new Map<string,number>();
    const depth=(id:string):number=>{if(depths.has(id))return depths.get(id)!;const topic=topics.find(t=>t.id===id)!;const n=topic.prerequisites.length?1+Math.max(...topic.prerequisites.map(depth)):0;depths.set(id,n);return n;};
    const rows=new Map<number,number>();
    return topics.map(topic=>{const x=depth(topic.id),y=rows.get(x)??0;rows.set(x,y+1);const p=progress[topic.id];const color=p.testPassed?'#e6f3ea':p.needsReview?'#fff4dc':'#fff';return {
      id:topic.id,position:{x:x*245,y:y*150},data:{label:<div data-topic-node={topic.id} data-status={p.testPassed?'passed':p.needsReview?'review':'learning'} className="text-left"><div className="text-[10px] text-[#657083]"><Text>{courseGroups[topic.group]}</Text></div><div className="mt-1 font-bold"><Text>{topic.title}</Text></div><div className="mt-2 text-xs"><Text>{p.testPassed?'✓ テスト合格':p.needsReview?'再確認が必要':p.attempted?'学習中':'未着手'}</Text> · {p.score}%</div></div>},style:{width:210,padding:12,borderRadius:10,background:color,border:`2px solid ${p.testPassed?'#1e7c3c':p.needsReview?'#c38a20':'#d9dde5'}`},
    } satisfies Node;});
  },[progress]);
  const edges:Edge[]=topics.flatMap(t=>t.prerequisites.map(id=>({id:`${id}-${t.id}`,source:id,target:t.id})));
  if(error)return <p role="alert"><Text>演習記録を読み込めません。ブラウザの保存設定を確認して再読み込みしてください。</Text></p>;
  if(!loaded)return <p role="status"><Text>基礎課程の記録を読み込んでいます…</Text></p>;
  return <section><p className="mb-3 text-sm"><Text>テスト合格</Text> {topics.filter(t=>progress[t.id].testPassed).length}/{topics.length} · <Text>再確認が必要</Text> {topics.filter(t=>progress[t.id].needsReview).length}</p><div className="h-[70vh] min-h-[500px] overflow-hidden rounded-xl border bg-white"><ReactFlow nodes={nodes} edges={edges} fitView minZoom={.08} maxZoom={2} onNodeClick={(_,node)=>onOpen(node.id)}><Background/><Controls/><MiniMap nodeColor={node=>String(node.style?.background??'#fff')} pannable zoomable/></ReactFlow></div></section>;
}
