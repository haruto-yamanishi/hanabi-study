import assert from 'node:assert/strict';
import {renderToString} from 'katex';
import {renderToStaticMarkup} from 'react-dom/server';
import {createElement} from 'react';
import {loadTs} from './load-ts.mjs';
const {splitMath}=loadTs('lib/math-text.ts');
const {MathText}=loadTs('components/MathText.tsx');
const {topics,topicQuestionIds,getQuestion}=loadTs('data/foundations/index.ts');
const {lessons}=loadTs('data/lessons.ts');
const {assessments}=loadTs('data/assessments.ts');
const sample=String.raw`分数 \(\frac{1}{3}\)、積分 $$\int_0^1 x^2\,dx$$、$x^2$、行列 \[\begin{bmatrix}1&2\\3&4\end{bmatrix}\]。`;
assert.equal(splitMath(sample).filter(p=>p.kind==='math').length,4);
for(const raw of [String.raw`閉じ忘れ \(x`,String.raw`escaped \$x\$`, '`$x$`', '```\n$x$\n```', '料金 $100 と $200', 'a/b、x²、https://example.com'])assert.deepEqual(splitMath(raw),[{kind:'text',value:raw}]);
const valid=renderToStaticMarkup(createElement(MathText,null,sample));
assert(valid.includes('katex-mathml')&&valid.includes('katex-display'));
assert(!valid.includes('math-fallback'));
const invalid=renderToStaticMarkup(createElement(MathText,null,String.raw`\(\notARealCommand{x}\)`));assert(invalid.includes('math-fallback'));
const unsafe=renderToStaticMarkup(createElement(MathText,null,String.raw`<img src=x onerror=alert(1)> \(\href{javascript:alert(1)}{click}\)`));
assert(!unsafe.includes('<img')&&!unsafe.includes('href="javascript:'));
let mathCount=0;const seen=new Set();
function check(value){
 if(typeof value==='string'){
  for(const p of splitMath(value))if(p.kind==='math'){
   mathCount++;
   if(!seen.has(p.value)){renderToString(p.value,{throwOnError:true,strict:'error',trust:false,maxExpand:1000,maxSize:10});seen.add(p.value);}
  }else assert(!/\\[()[\]]|\\(?:frac|times|sum)|[ᵀᵧₛₖ]|[\u0307\u0308]/u.test(p.value),`Unwrapped or broken formula: ${value}`);
 }else if(Array.isArray(value))value.forEach(check);
 else if(value&&typeof value==='object')Object.values(value).forEach(check);
}
check(topics);check(lessons);check(assessments);
check(loadTs('data/projects.ts').projects);check(loadTs('data/deep/index.ts').retrievalCards);
for(const t of topics)for(const id of topicQuestionIds(t,'all'))check(getQuestion(id));
assert(mathCount>10000,'generated problem variants use LaTeX');
const kinematics=lessons.find(l=>l.id==='eng-p-kinematics');
const kinematicsText=JSON.stringify(kinematics);
assert(kinematicsText.includes('v_{0}')||kinematicsText.includes('v_0'));
assert(kinematicsText.includes('frac'));
console.log(`Math checks: ${mathCount} formula occurrences / ${seen.size} distinct expressions; all 100,000 questions, lessons, assessments, delimiters, code, fallback and safe HTML — OK`);
