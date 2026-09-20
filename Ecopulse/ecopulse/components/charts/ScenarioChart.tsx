'use client';

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { IndicatorId } from '@/lib/types';
import { INDICATORS } from '@/data/indicators';

export function ScenarioChart({ before, after }: { before: Record<IndicatorId, number>; after: Record<IndicatorId, number> }) {
  const data = INDICATORS.map((i) => ({ name: i.label, Current: Math.round(before[i.id] * 10) / 10, Scenario: Math.round(after[i.id] * 10) / 10 }));
  return (
    <div
      className="h-80 w-full"
      role="img"
      aria-label={`Current versus scenario score per indicator: ${data.map((d) => `${d.name} ${d.Current} to ${d.Scenario}`).join('; ')}`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 8 }} barGap={2}>
          <CartesianGrid stroke="#E3EAEB" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: '#586B72' }} />
          <YAxis type="category" dataKey="name" width={118} tick={{ fontSize: 13, fill: '#0B1B20' }} axisLine={false} tickLine={false} />
          <Tooltip formatter={(v: any) => [`${v} out of 100`]} contentStyle={{ borderRadius: 6, border: '1px solid #D1DBDC', fontSize: 13 }} cursor={{ fill: '#EDF2F2' }} />
          <Legend wrapperStyle={{ fontSize: 13 }} />
          <Bar dataKey="Current" fill="#9DB0B4" barSize={10} isAnimationActive={false} />
          <Bar dataKey="Scenario" fill="#0A716C" barSize={10} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
