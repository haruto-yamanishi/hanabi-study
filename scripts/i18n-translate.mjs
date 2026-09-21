// Maintenance only: explicit opt-in sends authored catalog text to Google Translate.
// Never imported by the app. No answers, study history, or personal notes are read.
if(!process.argv.includes('--allow-external-translation'))throw new Error('Pass --allow-external-translation to send data/i18n/messages.json to Google Translate.');
import fs from 'node:fs';
const keys=JSON.parse(fs.readFileSync('data/i18n/messages.json','utf8'));
const file='data/i18n/en.json';
const output=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{};
const overrides=JSON.parse(fs.readFileSync('data/i18n/overrides.json','utf8'));
const missing=keys.filter(key=>!output[key]&&!overrides[key]);
const tokens=text=>(text.match(/ZXQ\d+XZ/g)??[]).sort().join('|');
const valid=(key,value)=>value.trim().length>0&&tokens(key)===tokens(value)&&!/[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u.test(value);
const save=()=>fs.writeFileSync(file,JSON.stringify(output,null,2)+'\n');
const translate=async q=>{
 const url=new URL('https://translate.googleapis.com/translate_a/single');
 for(const [k,v]of Object.entries({client:'gtx',sl:'ja',tl:'en',dt:'t',q}))url.searchParams.set(k,v);
 const response=await fetch(url,{signal:AbortSignal.timeout(30000)});
 if(!response.ok)throw new Error(`Translation HTTP ${response.status}`);
 return (await response.json())[0].map(row=>row[0]).join('').replace(/ZXQ\s*(\d+)\s*XZ/gi,'ZXQ$1XZ').replace(/`+/g,'"');
};
console.log(`${missing.length} missing translations`);
const failed=[];
for(let i=0;i<missing.length;){
 const batch=[];let length=0;
 while(i<missing.length&&batch.length<16&&length+missing[i].length<2200){batch.push(missing[i++]);length+=batch.at(-1).length;}
 if(!batch.length)batch.push(missing[i++]);
 try{
  const translated=await translate(batch.map((key,n)=>`QQSTART${n}QQ ${key} QQEND${n}QQ`).join('\n'));
  batch.forEach((key,n)=>{const match=translated.match(new RegExp(`QQSTART\\s*${n}\\s*QQ\\s*([\\s\\S]*?)\\s*QQEND\\s*${n}\\s*QQ`,'i'));if(match&&valid(key,match[1]))output[key]=match[1];else failed.push(key);});
 }catch(error){console.error(error.message);failed.push(...batch);}
 save();console.log(`${i}/${missing.length}; retry ${failed.length}`);
}
for(const key of failed){try{const value=await translate(key);if(valid(key,value))output[key]=value;}catch(error){console.error(error.message);}save();}
const remaining=keys.filter(key=>!output[key]&&!overrides[key]);
console.log(`Untranslated: ${remaining.length}`);
if(remaining.length){console.log(remaining);process.exitCode=1;}
