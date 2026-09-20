import { loadTs } from './load-ts.mjs';
const {skills,resources,roadmapStages}=loadTs('data/curriculum.ts');
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

const { coverageForSkill } = loadTs('lib/content.ts');
const coverage = skill => coverageForSkill(skill, lessons, assessments);
const {engineeringUnits,engineeringLessons}=loadTs('data/engineering.ts');
const {projects}=loadTs('data/projects.ts');
const resourceIds=new Set(resources.map(r=>r.id));
for(const l of lessons){
  dup(l.steps,`${l.id} step`);
  for(const id of l.resourceIds??[]) if(!resourceIds.has(id)) errors.push(`${l.id}: missing resource ${id}`);
  for(const step of l.steps){
    if(!step.body?.trim()) errors.push(`${l.id}/${step.id}: empty body`);
    if(step.options && (!Number.isInteger(step.answer)||step.answer<0||step.answer>=step.options.length)) errors.push(`${l.id}/${step.id}: invalid answer`);
    if(step.numericAnswer!==undefined&&!Number.isFinite(step.numericAnswer)) errors.push(`${l.id}/${step.id}: invalid numeric answer`);
  }
}
for(const a of assessments){
  if(!a.prompt?.trim()||!a.explanation?.trim()) errors.push(`${a.id}: missing explanation or prompt`);
  if(a.format==='mcq' && (!a.options||!Number.isInteger(a.answer)||a.answer<0||a.answer>=a.options.length)) errors.push(`${a.id}: invalid MCQ answer`);
  if(a.format==='numeric' && (!Number.isFinite(Number(a.answer))||(a.tolerance??0)<0)) errors.push(`${a.id}: invalid numeric answer`);
}
const visited=new Set(),visiting=new Set();
function visit(id){
  if(visiting.has(id)){errors.push(`prerequisite cycle: ${id}`);return;}
  if(visited.has(id))return;
  visiting.add(id);
  for(const p of skills.find(s=>s.id===id)?.prerequisites??[])visit(p);
  visiting.delete(id);visited.add(id);
}
for(const skill of skills){
  visit(skill.id);
  if(!coverage(skill).full)errors.push(`${skill.id}: incomplete coverage`);
  if(!roadmapStages.some(stage=>stage.sections.includes(skill.section)))errors.push(`${skill.id}: missing roadmap stage`);
  const units=engineeringUnits.filter(u=>u.skillId===skill.id);
  if(units.length!==1)errors.push(`${skill.id}: expected one authored core unit, found ${units.length}`);
  if(!engineeringLessons.some(l=>l.skillId===skill.id&&l.practical))errors.push(`${skill.id}: missing workshop`);
}
for(const u of engineeringUnits){
  if(!skillIds.has(u.skillId))errors.push(`${u.skillId}: orphan unit`);
  if(u.concept.length<100||u.example.length<30||u.lab.length<50)errors.push(`${u.skillId}: insufficient authored text`);
  if(u.calculations[0][0]===u.calculations[1][0])errors.push(`${u.skillId}: repeated review prompt`);
}
dup(projects,'project');
const projectIds=new Set(projects.map(p=>p.id));
for(const [index,p] of projects.entries()){
  for(const id of p.skills)if(!skillIds.has(id))errors.push(`${p.id}: unknown skill ${id}`);
  for(const id of p.requires)if(!projectIds.has(id)||projects.findIndex(x=>x.id===id)>=index)errors.push(`${p.id}: invalid project prerequisite ${id}`);
  dup(p.rubric,`${p.id} rubric`);
  if(p.procedure.length<3||p.rubric.length<3)errors.push(`${p.id}: missing project instructions or rubric`);
}
for(const domain of new Set(skills.map(s=>s.domain)))if(!projects.some(p=>p.skills.some(id=>skills.find(s=>s.id===id)?.domain===domain)))errors.push(`${domain}: no project coverage`);
const domains=[...new Set(skills.map(s=>s.domain))];
console.log(`Hanabi Study content audit — ${skills.length} skills / ${lessons.length} lessons / ${assessments.length} assessments`);
console.log('');
console.log('Domain       Coverage  Basic   Full');
for(const d of domains){const set=skills.filter(s=>s.domain===d), rows=set.map(coverage);const pct=Math.round(rows.reduce((a,r)=>a+r.percent,0)/set.length);console.log(`${d.padEnd(12)} ${String(pct).padStart(3)}%      ${String(rows.filter(r=>r.basic).length).padStart(2)}/${String(set.length).padEnd(2)}   ${String(rows.filter(r=>r.full).length).padStart(2)}/${set.length}`)}
const missing=skills.map(s=>({s,c:coverage(s)})).filter(x=>!x.c.full).sort((a,b)=>a.c.percent-b.c.percent);
console.log(`\nLowest coverage:`);for(const {s,c} of missing.slice(0,15))console.log(`- ${s.id.padEnd(20)} ${String(c.percent).padStart(3)}%  ${Object.entries(c.has).filter(([,v])=>!v).map(([k])=>k).join(', ')}`);
if(errors.length){console.error('\nIntegrity errors:');errors.forEach(e=>console.error(`- ${e}`));process.exitCode=1}else console.log('\nIntegrity: OK');
