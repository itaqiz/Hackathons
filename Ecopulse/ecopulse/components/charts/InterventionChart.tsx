'use client';

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Intervention } from '@/lib/types';

const short = (n: string) => (n.length > 24 ? `${n.slice(0, 22)}...` : n);

export function InterventionChart({ items }: { items: Intervention[] }) {
  const data = items.map((i) => ({ name: short(i.name), Effort: i.effort, Benefit: i.benefit }));
  return (
    <div
      className="w-full"
      style={{ height: 70 + items.length * 56 }}
      role="img"
      aria-label={`Effort and benefit ratings out of 5: ${items.map((i) => `${i.name}, effort ${i.effort}, benefit ${i.benefit}`).join('; ')}`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 8 }} barGap={2}>
          <CartesianGrid stroke="#E3EAEB" horizontal={false} />
          <XAxis type="number" domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tick={{ fontSize: 12, fill: '#586B72' }} />
          <YAxis type="category" dataKey="name" width={132} tick={{ fontSize: 12, fill: '#0B1B20' }} axisLine={false} tickLine={false} />
          <Tooltip formatter={(v: any) => [`${v} out of 5`]} contentStyle={{ borderRadius: 6, border: '1px solid #D1DBDC', fontSize: 13 }} cursor={{ fill: '#EDF2F2' }} />
          <Legend wrapperStyle={{ fontSize: 13 }} />
          <Bar dataKey="Effort" fill="#C9A24A" barSize={10} isAnimationActive={false} />
          <Bar dataKey="Benefit" fill="#0A716C" barSize={10} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
