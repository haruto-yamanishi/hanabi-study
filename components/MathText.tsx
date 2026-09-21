import { memo } from 'react';
import { renderToString } from 'katex';
import { splitMath } from '@/lib/math-text';
import { translateText } from '@/lib/i18n';
import { useLanguageStore } from '@/lib/language-store';

/** Render authored LaTeX without interpreting prose or accepting raw HTML. */
export const MathText = memo(function MathText({ children = '' }: { children?: string }) {
  const language=useLanguageStore(s=>s.language);
  return <span className="math-text" data-math-source={children}>{splitMath(translateText(children,language)).map((part,index)=>{
    if(part.kind==='text')return part.value;
    try {
      const html=renderToString(part.value,{
        displayMode:part.display,output:'htmlAndMathml',throwOnError:true,
        trust:false,strict:'error',maxExpand:1000,maxSize:10,
      });
      return <span key={index} className={part.display?'math-formula math-block':'math-formula'} dangerouslySetInnerHTML={{__html:html}}/>;
    } catch {
      return <code key={index} className="math-fallback" title="数式の表示形式を確認してください">{part.value}</code>;
    }
  })}</span>;
});
