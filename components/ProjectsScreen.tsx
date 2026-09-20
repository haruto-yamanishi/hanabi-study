'use client';

import { useState } from 'react';
import { engineeringLessons } from '@/data/engineering';
import { projects } from '@/data/projects';
import { skills } from '@/data/curriculum';
import { useMasteryStore } from '@/lib/store';
import { practicalReady, workshopChecks } from '@/lib/graduation';
import { defaultState, skillStatus } from '@/lib/mastery';
import { ControlLab } from './ControlLab';
import { PracticalNotebook } from './PracticalNotebook';

export function ProjectsScreen({ onOpenLesson }: { onOpenLesson: (id: string) => void }) {
  const { practicalSubmissions, lessonProgress, states } = useMasteryStore();
  const [selected, setSelected] = useState(projects[0].id);
  const project = projects.find(p => p.id === selected)!;
  const recorded = (id: string) => {
    const p = projects.find(x => x.id === id)!;
    return practicalReady(practicalSubmissions[id], p.rubric.map(c => c.id), true);
  };
  const completed = engineeringLessons.filter(l => lessonProgress[l.id]?.completed && (lessonProgress[l.id]?.checkpointScore ?? 0) >= 80).length;
  const retained = skills.filter(s => skillStatus(states[s.id] ?? defaultState()) === 'mastered').length;
  const workshops = engineeringLessons.filter(l => practicalReady(practicalSubmissions[l.id], workshopChecks.map(c => c.id))).length;
  const portfolios = projects.filter(p => recorded(p.id)).length;
  const missing = project.requires.filter(id => !recorded(id));
  const ready = completed === engineeringLessons.length && retained === skills.length && workshops === engineeringLessons.length && portfolios === projects.length;
  return <div className="space-y-5">
    <section className="panel p-6">
      <div className="kicker">Engineering portfolio</div><h2 className="mt-2 text-2xl font-bold">知識を、設計・実装・検証へ</h2>
      <p className="mt-3 text-sm leading-7 text-[#657083]">8つの制作課題を通して、機械・電装・制御を統合します。目安は制作だけで約{projects.reduce((a,p) => a+p.hours,0)}時間。各スキルの学習・復習は別に進めます。実機がなくてもシミュレーションから始められます。</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-4">{[
        ['基幹教材・確認80%以上',completed,engineeringLessons.length],['知識の定着',retained,skills.length],['スキル実習の記録',workshops,engineeringLessons.length],['制作・レビュー記録',portfolios,projects.length],
      ].map(([label, count, total]) => <div key={label} className="rounded-xl bg-[#f8f9fb] p-4"><div className="text-xs text-[#657083]">{label}</div><div className="mt-2 text-2xl font-bold">{count}/{total}</div></div>)}</div>
      <p className="mt-4 text-sm font-semibold text-[#0857a2]">{ready ? '最終レビューに必要な学習・提出記録が揃いました。' : '読了・定着・実習・制作の4つを揃えて最終レビューへ進みます。'}</p>
      <p className="mt-2 text-xs leading-6 text-[#657083]">ここで確認できるのは学習と自己申告の記録です。実機での技能は、監督者による製作・配線・調整・故障診断の確認で判断します。シミュレーションの結果は実機検証と区別して残してください。</p>
    </section>
    <div className="grid gap-5 xl:grid-cols-[290px_1fr]">
      <div className="space-y-2">{projects.map(p => <button key={p.id} onClick={() => setSelected(p.id)} className={`w-full rounded-xl border p-4 text-left ${selected === p.id ? 'border-[#0857a2] bg-[#e6eff7]' : 'border-[#d9dde5] bg-white'}`}><div className="text-sm font-bold">{p.title}</div><div className="mt-2 text-xs text-[#657083]">約{p.hours}時間 · {recorded(p.id) ? 'レビュー記録あり' : '制作・検証待ち'}</div></button>)}</div>
      <section className="panel p-6" key={project.id}>
        <h3 className="text-xl font-bold">{project.title}</h3><p className="mt-3 text-sm leading-7">{project.goal}</p>
        {missing.length > 0 && <p className="mt-4 rounded-xl bg-[#fff4dc] p-3 text-xs leading-6">先に取り組む課題：{missing.map(id => projects.find(p => p.id === id)!.title).join(' ／ ')}。内容の先読みはできます。</p>}
        <h4 className="mt-6 font-bold">準備するもの</h4><p className="mt-2 text-sm leading-7 text-[#657083]">{project.equipment}</p>
        <h4 className="mt-6 font-bold">設計課題と条件</h4><p className="mt-2 text-sm leading-7">{project.brief}</p>
        <h4 className="mt-6 font-bold">進め方</h4><ol className="mt-3 list-decimal space-y-3 pl-5 text-sm leading-7">{project.procedure.map(text => <li key={text}>{text}</li>)}</ol>
        <h4 className="mt-6 font-bold">関連教材へ戻る</h4><div className="mt-3 flex flex-wrap gap-2">{project.skills.map(id => <button key={id} onClick={() => onOpenLesson(`eng-${id}`)} className="rounded-full border px-3 py-2 text-xs text-[#0857a2]">{skills.find(s => s.id === id)!.nameJa}</button>)}</div>
        {project.id === 'project-control' && <ControlLab/>}
        <PracticalNotebook id={project.id} checks={project.rubric} review/>
      </section>
    </div>
  </div>;
}
