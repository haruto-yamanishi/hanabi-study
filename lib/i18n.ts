import english from '@/data/i18n/en.json';
import overrides from '@/data/i18n/overrides.json';
import { messagePattern, restoreMessage } from './i18n-text';
import type { Language } from './language-store';

const dictionary:Record<string,string>={...english,...overrides};
export function translateText(text:string,language:Language):string {
  if(language==='ja')return text;
  const {key,tokens}=messagePattern(text);
  const translation=dictionary[key];
  if(translation!==undefined)return (text.match(/^\s*/)?.[0]??'')+restoreMessage(translation,tokens)+(text.match(/\s*$/)?.[0]??'');
  // JSX sometimes composes a sentence from independent labels and values.
  return text.split(/(\n| · |：| ／ | → |、)/).map(part=>{
    const pattern=messagePattern(part);
    return dictionary[pattern.key]===undefined?part:restoreMessage(dictionary[pattern.key],pattern.tokens);
  }).join('');
}
