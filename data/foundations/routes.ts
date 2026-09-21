import { topics } from './index';
export const middleSchoolTopics = new Set(['signed','fractions','ratio','percent','powers','roots','units','scientific','expand','factor','linear-eq','simultaneous','quadratic','inequality','functions','pythagoras','similarity']);
export const topicLevel=(id:string)=>middleSchoolTopics.has(id)?'中学数学から':'高専・大学基礎への接続';
// Pointers to our own lessons, not textbook page mappings or copied textbook problems.
export const textbookRoutes = [
  {name:'基礎数学でつまずいた',ids:['signed','fractions','expand','linear-eq','functions','trig'],url:'https://www.dainippon-tosho.co.jp/college_math/fundamental.html'},
  {name:'線形代数でつまずいた',ids:['simultaneous','vectors','matrix','det','rank'],url:'https://www.dainippon-tosho.co.jp/college_math/linear.html'},
  {name:'微分積分でつまずいた',ids:['functions','factor','limits','derivative','integral'],url:'https://www.dainippon-tosho.co.jp/college_math/differential1.html'},
  {name:'確率統計でつまずいた',ids:['fractions','ratio','counting','conditional','variance'],url:'https://www.dainippon-tosho.co.jp/college_math/probability.html'},
  {name:'応用数学へ進む前に',ids:['vectors','partial','integral','ode','series'],url:'https://www.dainippon-tosho.co.jp/college_math/applied.html'},
];
export function prerequisitePath(from:string,to:string):string[]|undefined {
  if(from===to)return [from];
  const current=topics.find(t=>t.id===from);
  for(const id of current?.prerequisites??[]){const child=prerequisitePath(id,to);if(child)return [from,...child];}
}
