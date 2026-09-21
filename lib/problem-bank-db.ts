'use client';
import { validBankJourney } from './remediation';
import { validBankRecord, type BankRecord, type BankRecords } from './problem-bank';
// Large exercise history lives in IndexedDB, separate from the existing localStorage progress.
const databaseName='hanabi-study-bank-v1';
let connection:Promise<IDBDatabase>|undefined;
function open(){
  if(!connection)connection=new Promise<IDBDatabase>((resolve,reject)=>{
    const request=indexedDB.open(databaseName,2);
    request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains('progress'))request.result.createObjectStore('progress',{keyPath:'id'});if(!request.result.objectStoreNames.contains('meta'))request.result.createObjectStore('meta');};
    request.onsuccess=()=>{request.result.onversionchange=()=>{request.result.close();connection=undefined;};resolve(request.result);};
    request.onerror=()=>{connection=undefined;reject(request.error);};
    request.onblocked=()=>{connection=undefined;reject(new Error('他のタブを閉じて保存を再試行してください。'));};
  });
  return connection;
}
async function transact<T>(mode:IDBTransactionMode,fn:(store:IDBObjectStore)=>IDBRequest<T>|void):Promise<T|undefined>{
  const db=await open();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction('progress',mode);let result:T|undefined;
    tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error??new Error('保存が中断されました。'));
    try{const req=fn(tx.objectStore('progress'));if(req)req.onsuccess=()=>{result=req.result;};}catch(error){tx.abort();reject(error);}
  });
}
export async function loadBankRecords():Promise<BankRecords>{
  const rows=await transact<BankRecord[]>('readonly',s=>s.getAll());
  return Object.fromEntries((rows??[]).filter(validBankRecord).map(r=>[r.id,r]));
}
export async function saveBankRecord(record:BankRecord){
  if(!validBankRecord(record))throw new Error('演習記録の形式が正しくありません。');
  await transact('readwrite',s=>s.put(record));
}
export async function replaceBankRecords(rows:unknown){
  if(!Array.isArray(rows)||!rows.every(validBankRecord)||new Set(rows.map(r=>r.id)).size!==rows.length)throw new Error('演習記録が不正です。既存の記録は変更していません。');
  await transact('readwrite',s=>{s.clear();for(const row of rows)s.put(row);});
}
export async function clearBankRecords(){await transact('readwrite',s=>s.clear());}

export async function loadBankJourney(){
  const db=await open();
  return new Promise<import('./remediation').BankJourney|null>((resolve,reject)=>{
    const tx=db.transaction('meta','readonly'),req=tx.objectStore('meta').get('journey');
    req.onsuccess=()=>resolve(validBankJourney(req.result)?req.result:null);req.onerror=()=>reject(req.error);
  });
}
export async function saveBankJourney(journey:import('./remediation').BankJourney|null){
  if(journey!==null&&!validBankJourney(journey))throw new Error('戻り先の記録が不正です。');
  const db=await open();
  await new Promise<void>((resolve,reject)=>{const tx=db.transaction('meta','readwrite');tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);tx.objectStore('meta').put(journey,'journey');});
}
export async function replaceBankSnapshot(rows:unknown,journey:unknown=null){
  if(!Array.isArray(rows)||!rows.every(validBankRecord)||new Set(rows.map(r=>r.id)).size!==rows.length||(journey!==null&&!validBankJourney(journey)))throw new Error('演習データの形式が不正です。既存データは変更していません。');
  const db=await open();
  await new Promise<void>((resolve,reject)=>{const tx=db.transaction(['progress','meta'],'readwrite');tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);const s=tx.objectStore('progress');s.clear();for(const row of rows)s.put(row);tx.objectStore('meta').put(journey,'journey');});
}
