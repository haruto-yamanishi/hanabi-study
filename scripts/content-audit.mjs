import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const ts=require('typescript');
const root=path.resolve(process.cwd());

function loadTs(relative, exportNames){
  let source=fs.readFileSync(path.join(root,relative),'utf8');
  source=source.replace(/^import[^;]+;\s*/gm,'');
  const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const mod={exports:{}};
  new Function('exports','module','require',js)(mod.exports,mod,()=>({}));
  const out={}; for(const n of exportNames) out[n]=mod.exports[n]; return out;
}

const {skills}=loadTs('data/curriculum.ts',['skills']);
const {lessons}=loadTs('data/lessons.ts',['lessons']);
const {assessments}=loadTs('data/assessments.ts',['assessments']);
const errors=[];
const dup=(items,label)=>{const seen=new Set();for(const x of items){if(seen.has(x.id))errors.push(`duplicate ${label}: ${x.id}`);seen.add(x.id)}};
dup(skills,'skill');dup(lessons,'lesson');dup(assessments,'assessment');
const skillIds=new Set(skills.map(s=>s.id)), assessmentIds=new Set(assessments.map(a=>a.id));
for(const s of skills) for(const p of s.prerequisites??[]) if(!skillIds.has(p)) errors.push(`${s.id}: missing prerequisite ${p}`);
for(const l of lessons){
  if(!skillIds.has(l.skillId)) errors.push(`${l.id}: missing skill ${l.skillId}`);
  if(!l.steps?.some(s=>s.kind==='recall')) errors.push(`${l.id}: missing recall step`);
  if(!l.steps?.some(s=>s.kind==='practice')) errors.push(`${l.id}: missing practice step`);
  if(!(l.checkpointIds??[]).length) errors.push(`${l.id}: missing checkpoint`);
  for(const id of l.checkpointIds??[]) if(!assessmentIds.has(id)) errors.push(`${l.id}: missing checkpoint ${id}`);
}
for(const a of assessments) if(!skillIds.has(a.skillId)) errors.push(`${a.id}: missing skill ${a.skillId}`);
const variantGroups=new Map();
for(const a of assessments){ if(a.variantGroup){ const xs=variantGroups.get(a.variantGroup)??[]; xs.push(a.id); variantGroups.set(a.variantGroup,xs); } }
for(const [g,ids] of variantGroups) if(ids.length<2) errors.push(`variant group ${g}: only ${ids.length} item`);
for(const s of skills) if(!(s.frcApplications??[]).length) errors.push(`${s.id}: missing FRC application`);

function coverage(skill){
  const ls=lessons.filter(l=>l.skillId===skill.id),items=assessments.filter(a=>a.skillId===skill.id);
  const needsDebug=['cs','electronics','mechanical','control','robotics'].includes(skill.domain);
  const has={
    concept:ls.some(l=>l.steps.some(s=>s.kind==='concept')),
    example:ls.some(l=>l.steps.some(s=>s.kind==='example')),
    recall:ls.some(l=>l.steps.some(s=>s.kind==='recall'))||items.some(a=>a.competency==='recall'),
    practice:ls.some(l=>l.steps.some(s=>s.kind==='practice'))||items.some(a=>['calculate','reproduce'].includes(a.competency)),
    transfer:items.some(a=>a.competency==='transfer'),
    checkpoint:ls.some(l=>l.checkpointIds?.length),
    review:items.some(a=>a.variantGroup&&assessments.some(b=>b.id!==a.id&&b.variantGroup===a.variantGroup)),
    debugDesign:!needsDebug||items.some(a=>a.competency==='debug'||a.competency==='design'),
    frc:(skill.frcApplications??[]).length>0,
  };
  const values=Object.values(has); return {has,percent:Math.round(values.filter(Boolean).length/values.length*100),basic:has.concept&&has.example&&has.recall&&has.practice&&has.checkpoint,full:values.every(Boolean)};
}
const domains=[...new Set(skills.map(s=>s.domain))];
console.log(`Hanabi Study content audit — ${skills.length} skills / ${lessons.length} lessons / ${assessments.length} assessments`);
console.log('');
console.log('Domain       Coverage  Basic   Full');
for(const d of domains){const set=skills.filter(s=>s.domain===d), rows=set.map(coverage);const pct=Math.round(rows.reduce((a,r)=>a+r.percent,0)/set.length);console.log(`${d.padEnd(12)} ${String(pct).padStart(3)}%      ${String(rows.filter(r=>r.basic).length).padStart(2)}/${String(set.length).padEnd(2)}   ${String(rows.filter(r=>r.full).length).padStart(2)}/${set.length}`)}
const missing=skills.map(s=>({s,c:coverage(s)})).filter(x=>!x.c.full).sort((a,b)=>a.c.percent-b.c.percent);
console.log(`\nLowest coverage:`);for(const {s,c} of missing.slice(0,15))console.log(`- ${s.id.padEnd(20)} ${String(c.percent).padStart(3)}%  ${Object.entries(c.has).filter(([,v])=>!v).map(([k])=>k).join(', ')}`);
if(errors.length){console.error('\nIntegrity errors:');errors.forEach(e=>console.error(`- ${e}`));process.exitCode=1}else console.log('\nIntegrity: OK');
