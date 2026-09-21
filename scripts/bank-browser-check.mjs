// Run only against a dedicated disposable Chromium profile on localhost:9223.
if(process.env.HANABI_BANK_BROWSER_TEST!=='1')throw new Error('Use HANABI_BANK_BROWSER_TEST=1 with a dedicated disposable browser profile; this test resets app data.');
import assert from 'node:assert/strict';
import fs from 'node:fs';
const target = await (await fetch('http://127.0.0.1:9223/json/new?about:blank', {method:'PUT'})).json();
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject});
let seq=0;const pending=new Map(), errors=[];
ws.onmessage=e=>{const data=JSON.parse(e.data);if(data.id){const task=pending.get(data.id);pending.delete(data.id);data.error?task.reject(data.error):task.resolve(data.result);}else if(data.method==='Runtime.exceptionThrown')errors.push(data.params.exceptionDetails.text);};
const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
const wait=async expression=>{for(let i=0;i<100;i++){if(await evaluate(`Boolean(${expression})`))return;await new Promise(r=>setTimeout(r,100));}throw new Error('Timeout: '+expression);};
const click=async text=>{await evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.getAttribute('aria-label')===${JSON.stringify(text)}||x.textContent.trim()===${JSON.stringify(text)});if(!b)throw new Error('button missing: '+${JSON.stringify(text)});b.click();})()`);};
const clickContains=async text=>{await evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(x=>x.textContent.includes(${JSON.stringify(text)}));if(!b)throw new Error('button missing');b.click();})()`);};
const input=async(selector,value)=>evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw new Error('input missing');const proto=e instanceof HTMLTextAreaElement?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(e,${JSON.stringify(value)});e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));})()`);
await call('Runtime.enable');await call('Page.enable');
await call('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
await call('Page.navigate',{url:'http://127.0.0.1:3100'});
await wait(`[...document.querySelectorAll('button[aria-label="学ぶ"]')].some(b=>Object.keys(b).some(k=>k.startsWith('__reactProps')))`);
const {loadTs}=await import('./load-ts.mjs');
const bank=loadTs('data/foundations/index.ts');
const answerByPrompt=new Map();for(const t of bank.topics)for(const id of bank.topicQuestionIds(t,'all')){const q=bank.getQuestion(id);answerByPrompt.set(q.prompt,q.answer);}
const readDB=async(store,key)=>evaluate(`new Promise((resolve,reject)=>{const r=indexedDB.open('hanabi-study-bank-v1',2);r.onsuccess=()=>{const db=r.result,tx=db.transaction(${JSON.stringify(store)},'readonly'),q=tx.objectStore(${JSON.stringify(store)})[${JSON.stringify(key?'get':'getAll')}](${key?JSON.stringify(key):''});q.onsuccess=()=>{resolve(q.result);db.close()};q.onerror=()=>reject(q.error)}})`);
await evaluate('window.confirm=()=>true');await click('データ');await click('進捗をリセット');await wait(`document.body.textContent.includes('全進捗をリセットしました')`);
await click('基礎・ドリル');await wait(`document.querySelector('input[aria-label="基礎単元を検索"]')`);
assert.equal(await evaluate(`document.querySelectorAll('button.panel').length`),10);
await input('input[aria-label="基礎単元を検索"]','離散PID');await wait(`document.querySelectorAll('button.panel').length===1`);await clickContains('離散PIDの各項');await click('練習10問');
await wait(`document.querySelector('input[aria-label="基礎演習の回答"]')`);
await input('input[aria-label="基礎演習の回答"]','999');await click('回答を保存して採点');await wait(`document.querySelector('textarea[aria-label="基礎演習の修正点"]')`);
assert(await evaluate(`[...document.querySelectorAll('button')].find(b=>b.textContent==='修正を保存して次へ').disabled`));
await input('textarea[aria-label="基礎演習の修正点"]','目標から測定を引いた誤差にゲインを掛ける。');await click('修正を保存して次へ');
await wait(`!document.querySelector('textarea[aria-label="基礎演習の修正点"]')`);
const origin=await evaluate(`(document.querySelector('h4')?.querySelector('[data-math-source]')?.getAttribute('data-math-source')??(document.querySelector('h4')?.querySelector('[data-math-source]')?.getAttribute('data-math-source')??document.querySelector('h4')?.textContent))`);
await click('わからない・前提からやり直す');await wait(`document.querySelector('[aria-label="戻り先の診断"]')`);
let depth=0;
while(await evaluate(`Boolean(document.querySelector('input[aria-label="前提診断の回答"]'))`)){
 await click('ここもわからない');await wait(`[...document.querySelectorAll('button')].some(b=>b.textContent==='さらに基礎を確認')`);await click('さらに基礎を確認');
 await new Promise(r=>setTimeout(r,50));assert(++depth<20);
}
assert(await evaluate(`document.body.textContent.includes('まず「正負の数と演算の順序」の基礎ドリルへ')`));
await click('この単元でやり直す');await wait(`document.body.textContent.includes('基礎を確認して元の問題へ戻る')`);
let journey=await readDB('meta','journey');assert.equal(journey.originQuestionId,'bank:pid:1:0');assert.equal(journey.targetTopicId,'signed');
await click('練習10問');
for(let i=0;i<4;i++){
 await wait(`document.querySelector('input[aria-label="基礎演習の回答"]')&&!document.querySelector('input[aria-label="基礎演習の回答"]').disabled`);
 const prompt=await evaluate(`(document.querySelector('h4')?.querySelector('[data-math-source]')?.getAttribute('data-math-source')??(document.querySelector('h4')?.querySelector('[data-math-source]')?.getAttribute('data-math-source')??document.querySelector('h4')?.textContent))`);const answer=answerByPrompt.get(prompt);assert.notEqual(answer,undefined,prompt);
 await input('input[aria-label="基礎演習の回答"]',String(answer));await click('回答を保存して採点');await wait(`document.querySelector('textarea[aria-label="基礎演習の修正点"]')`);await click('修正を保存して次へ');
}
await wait(`document.body.textContent.includes('基礎ドリルの目安（各問題型2問の自力正答）を満たしました')`);
await call('Page.reload');await wait(`[...document.querySelectorAll('button[aria-label="基礎・ドリル"]')].some(b=>Object.keys(b).some(k=>k.startsWith('__reactProps')))`);await click('基礎・ドリル');await wait(`document.body.textContent.includes('元の問題・単元に戻る')`);
fs.writeFileSync('/private/tmp/hanabi-recovery-desktop.png',Buffer.from((await call('Page.captureScreenshot',{format:'png'})).data,'base64'));
await call('Emulation.setDeviceMetricsOverride',{width:375,height:812,deviceScaleFactor:1,mobile:true});assert(await evaluate(`document.documentElement.scrollWidth<=window.innerWidth`));
fs.writeFileSync('/private/tmp/hanabi-recovery-mobile.png',Buffer.from((await call('Page.captureScreenshot',{format:'png'})).data,'base64'));
await click('データ');await evaluate(`window.__exports=[];window.__create=URL.createObjectURL;URL.createObjectURL=b=>{b.text().then(t=>window.__exports.push(JSON.parse(t)));return window.__create(b)};HTMLAnchorElement.prototype.click=function(){};window.confirm=()=>true;`);
await click('JSONを書き出す');await wait(`window.__exports.length===1`);
const exported=await evaluate(`window.__exports[0]`);assert.equal(exported.version,5);assert.equal(exported.bankJourney.originTopicId,'pid');assert(exported.bankRecords.length>=5);
await click('進捗をリセット');await wait(`document.body.textContent.includes('全進捗をリセットしました')`);assert.equal((await readDB('progress')).length,0);assert.equal(await readDB('meta','journey'),null);
const upload=async value=>{await evaluate(`(()=>{const dt=new DataTransfer();dt.items.add(new File([JSON.stringify(${JSON.stringify(value)})],'check.json',{type:'application/json'}));const e=document.querySelector('input[type="file"]');e.files=dt.files;e.dispatchEvent(new Event('change',{bubbles:true}));})()`);};
await upload(exported);await wait(`document.body.textContent.includes('演習と戻り先を含めて読み込みました')`);
assert.equal((await readDB('progress')).length,exported.bankRecords.length);
await upload({...exported,bankRecords:[{id:'bad'}]});await wait(`document.body.textContent.includes('演習データの形式が不正')`);assert.equal((await readDB('progress')).length,exported.bankRecords.length);
await click('基礎・ドリル');await wait(`document.body.textContent.includes('元の問題・単元に戻る')`);await click('元の問題・単元に戻る');await wait(`document.querySelector('input[aria-label="基礎演習の回答"]')`);
assert.equal(await evaluate(`(document.querySelector('h4')?.querySelector('[data-math-source]')?.getAttribute('data-math-source')??(document.querySelector('h4')?.querySelector('[data-math-source]')?.getAttribute('data-math-source')??document.querySelector('h4')?.textContent))`),origin);assert.equal(await readDB('meta','journey'),null);

await click('ここで終了・解説へ戻る');await click('練習10問');await wait(`document.querySelector('input[aria-label="基礎演習の回答"]')`);
await input('input[aria-label="基礎演習の回答"]','999');await click('回答を保存して採点');await wait(`document.body.textContent.includes('この問題で再び止まっています')`);
await input('textarea[aria-label="基礎演習の修正点"]','式を覚える前に前提の変化率を確認する。');await click('修正を保存して前提を確認');await wait(`document.querySelector('[aria-label="戻り先の診断"]')`);
await click('学ぶ');await wait(`document.querySelectorAll('button.panel').length===169`);await clickContains('単位をそろえて設計値を見積もる');await click('わからないところを基礎ドリルで確認');await wait(`document.querySelector('h3')?.textContent==='正負の数と演算の順序'`);
await click('データ');await upload({version:3,states:{},evidence:[],assessmentHistory:[]});await wait(`document.body.textContent.includes('演習と戻り先を含めて読み込みました')`);assert.equal((await readDB('progress')).length,0);assert.equal(await readDB('meta','journey'),null);
await click('基礎・ドリル');await wait(`document.body.textContent.includes('正負の数と演算の順序')`);await click('練習10問');await wait(`document.querySelector('input[aria-label="基礎演習の回答"]')`);
await input('input[aria-label="基礎演習の回答"]','-1');await evaluate(`window.__put=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(...args){if(this.name==='progress')throw new DOMException('保存容量の検証','QuotaExceededError');return window.__put.apply(this,args)}`);await click('回答を保存して採点');await wait(`document.querySelector('[role="alert"]')`);assert.equal((await readDB('progress')).length,0);
await evaluate(`IDBObjectStore.prototype.put=window.__put`);await click('回答を保存して採点');await wait(`document.querySelector('textarea[aria-label="基礎演習の修正点"]')`);assert.equal((await readDB('progress')).length,1);
console.log('Browser: repeated-error routing, legacy lesson bridge, legacy import, storage-failure retry — OK');
assert.deepEqual(errors,[],'browser exceptions');
console.log('Browser: 100k bank, paginated catalogue, wrong-answer correction, recursive PID→middle-school diagnosis, drills, persisted return point, exact original-question return, v5 export/import/reset, invalid import preservation, mobile layout — OK');
await call('Page.close');ws.close();
