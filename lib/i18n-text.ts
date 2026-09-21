import { splitMath } from './math-text';

export function messagePattern(text:string){
  const tokens:string[]=[];
  const token=(value:string)=>{const key=`ZXQ${tokens.length}XZ`;tokens.push(value);return key;};
  const key=splitMath(text).map(part=>part.kind==='math'
    ? token(part.display?`\\[${part.value}\\]`:`\\(${part.value}\\)`)
    : part.value.replace(/`[^`]*`|https?:\/\/[^\s、。]+|[+-]?(?:(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?)(?:[eE][+-]?\d+)?/g,token)
  ).join('').replace(/\s+/g,' ').trim();
  return {key,tokens};
}

export function restoreMessage(template:string,tokens:string[]){
  return template.replace(/ZXQ(\d+)XZ/g,(_,index)=>tokens[Number(index)]??'');
}

export const hasJapanese=(text:string)=>/[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u.test(text);
