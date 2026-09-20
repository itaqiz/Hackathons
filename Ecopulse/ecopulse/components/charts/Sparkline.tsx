export function Sparkline({ values, color, label }: { values: number[]; color: string; label: string }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(max - min, 4);
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * 120},${30 - ((v - min) / span) * 26 - 2}`);
  const last = pts[pts.length - 1].split(',');
  return (
    <svg viewBox="0 0 120 32" className="h-8 w-full" preserveAspectRatio="none" role="img" aria-label={label}>
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <circle cx={last[0]} cy={last[1]} r="2.4" fill={color} />
    </svg>
  );
}
