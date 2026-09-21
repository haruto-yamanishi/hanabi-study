import fs from 'node:fs';
import ts from 'typescript';
import {loadTs} from './load-ts.mjs';
const {messagePattern,hasJapanese}=loadTs('lib/i18n-text.ts');
const keys=new Set();
const add=text=>{if(typeof text!=='string'||!hasJapanese(text))return;keys.add(messagePattern(text).key);};
function visit(x){if(typeof x==='string')add(x);else if(Array.isArray(x))x.forEach(visit);else if(x&&typeof x==='object')Object.values(x).forEach(visit);}
visit(loadTs('data/lessons.ts').lessons);visit(loadTs('data/assessments.ts').assessments);
visit(loadTs('data/deep/index.ts').retrievalCards);visit(loadTs('data/projects.ts').projects);
visit(loadTs('data/curriculum.ts'));
const bank=loadTs('data/foundations/index.ts');visit(bank.topics);visit(bank.courseGroups);
for(const t of bank.topics)for(const id of bank.topicQuestionIds(t,'all'))visit(bank.getQuestion(id));
function sourceFiles(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?(entry.name==='i18n'?[]:sourceFiles(`${dir}/${entry.name}`)):/\.tsx?$/.test(entry.name)?[`${dir}/${entry.name}`]:[]);}
for(const file of ['components','lib','data'].flatMap(sourceFiles)){
 const source=fs.readFileSync(file,'utf8'),sf=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true);
 function walk(n){
  if(ts.isStringLiteral(n)||ts.isNoSubstitutionTemplateLiteral(n))add(n.text);
  else if(ts.isJsxText(n))add(n.text.replace(/\s+/g,' ').trim());
  else if(ts.isTemplateExpression(n))add(n.head.text+n.templateSpans.map(s=>'1'+s.literal.text).join(''));
  ts.forEachChild(n,walk);
 }
 walk(sf);
}
fs.mkdirSync('data/i18n',{recursive:true});
fs.writeFileSync('data/i18n/messages.json',JSON.stringify([...keys].sort(),null,2)+'\n');
console.log(`${keys.size} English message keys extracted, including all generated questions.`);
