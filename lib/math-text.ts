export type MathPart = { kind: 'text' | 'math'; value: string; display?: boolean };

// Only explicit delimiters are interpreted. Code and ordinary prose stay literal.
export function splitMath(text: string): MathPart[] {
  const parts: MathPart[] = [];
  let start = 0, i = 0;
  const escaped = (at: number) => { let count=0; while(at>0 && text[--at]==='\\')count++; return count%2===1; };
  while (i < text.length) {
    if (text[i]==='`') {
      const marker=text.startsWith('```',i)?'```':'`';
      const end=text.indexOf(marker,i+marker.length);
      i=end<0?text.length:end+marker.length;continue;
    }
    if (escaped(i)) { i++; continue; }
    const open=['\\[','\\(','$$','$'].find(token=>text.startsWith(token,i));
    if (!open) { i++; continue; }
    const close=open==='\\['?'\\]':open==='\\('? '\\)':open;
    let end=text.indexOf(close,i+open.length);
    while(end>=0 && escaped(end))end=text.indexOf(close,end+close.length);
    if(end<0){i+=open.length;continue;}
    const value=text.slice(i+open.length,end);
    if(!value.trim() || (open==='$' && (/^\s|\s$|\n/.test(value)))){i+=open.length;continue;}
    if(i>start)parts.push({kind:'text',value:text.slice(start,i)});
    parts.push({kind:'math',value,display:open==='$$'||open==='\\['});
    i=end+close.length;start=i;
  }
  if(start<text.length)parts.push({kind:'text',value:text.slice(start)});
  return parts;
}
