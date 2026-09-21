'use client';
import { Text, tr } from './Text';


export function RadarChart({
  labels, values, size = 360, selectedIndex = null, onSelect,
}: {
  labels: string[];
  values: number[];
  size?: number;
  selectedIndex?: number|null;
  onSelect?: (index:number)=>void;
}) {
  const center = size / 2;
  const radius = size * .34;
  const points = labels.map((_, i) => {
    const angle = -Math.PI / 2 + i * Math.PI * 2 / labels.length;
    return { angle, x: center + Math.cos(angle) * radius, y: center + Math.sin(angle) * radius };
  });
  const dataPoints = values.map((value, i) => {
    const r = radius * Math.max(0, Math.min(100, value)) / 100;
    return { x: center + Math.cos(points[i].angle) * r, y: center + Math.sin(points[i].angle) * r };
  });
  const polygon = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  return <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto w-full max-w-[420px]" role="img" aria-label={tr("分野別達成度レーダーチャート")}>
    {[20,40,60,80,100].map(level => {
      const ring = points.map(p => {
        const r = radius * level / 100;
        return `${center + Math.cos(p.angle)*r},${center + Math.sin(p.angle)*r}`;
      }).join(' ');
      return <polygon key={level} points={ring} fill="none" stroke="#e1e4eb" strokeWidth="1" />;
    })}
    {points.map((p, i) => <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="#e1e4eb" strokeWidth="1" />)}
    <polygon points={polygon} fill="rgba(8,87,162,.14)" stroke="#0857a2" strokeWidth="2.5" />
    {dataPoints.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={selectedIndex===i?6:4} fill={selectedIndex===i?'#c83833':'#0857a2'} />)}
    {points.map((p, i) => {
      const x = center + Math.cos(p.angle) * radius * 1.22;
      const y = center + Math.sin(p.angle) * radius * 1.22;
      return <g key={labels[i]} onClick={()=>onSelect?.(i)} className={onSelect?'cursor-pointer':''} role={onSelect?'button':undefined} tabIndex={onSelect?0:undefined} onKeyDown={e=>{if(onSelect&&(e.key==='Enter'||e.key===' ')){e.preventDefault();onSelect(i)}}}>
        {selectedIndex===i&&<circle cx={x} cy={y} r="25" fill="#f9e9e8"/>}
        <text x={x} y={y - 4} textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="700" fill={selectedIndex===i?'#a92d29':'#334155'}><Text plain>{labels[i]}</Text></text>
        <text x={x} y={y + 11} textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="#64748b"><Text plain>{Math.round(values[i])}</Text></text>
      </g>;
    })}
  </svg>;
}
