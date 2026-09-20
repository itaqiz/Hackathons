'use client';

import { Bar, BarChart, Cell, LabelList, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Period } from '@/lib/types';
import { INDICATORS, SERIES } from '@/data/indicators';
import { PERIOD_LABEL, changeOver } from '@/lib/series';
import { STATUS } from '@/lib/scoring';

/** Answers: which indicators moved, and in which direction, over the selected period? */
export function ChangeChart({ period }: { period: Period }) {
  const data = INDICATORS.map((i) => ({ name: i.label, change: changeOver(SERIES[i.id], period).points }));
  const bound = Math.max(2, Math.ceil(Math.max(...data.map((d) => Math.abs(d.change)))) + 1);
  return (
    <div
      className="h-72 w-full"
      role="img"
      aria-label={`Change in score points per indicator over the last ${PERIOD_LABEL[period]}: ${data.map((d) => `${d.name} ${d.change}`).join(', ')}`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 40, bottom: 4, left: 8 }}>
          <XAxis type="number" domain={[-bound, bound]} tick={{ fontSize: 12, fill: '#586B72' }} tickFormatter={(v) => (v > 0 ? `+${v}` : `${v}`)} />
          <YAxis type="category" dataKey="name" width={118} tick={{ fontSize: 13, fill: '#0B1B20' }} axisLine={false} tickLine={false} />
          <ReferenceLine x={0} stroke="#586B72" />
          <Tooltip formatter={(v: any) => [`${v > 0 ? '+' : ''}${v} points`, 'Change']} contentStyle={{ borderRadius: 6, border: '1px solid #D1DBDC', fontSize: 13 }} cursor={{ fill: '#EDF2F2' }} />
          <Bar dataKey="change" isAnimationActive={false} barSize={18}>
            {data.map((d) => (
              <Cell key={d.name} fill={d.change >= 0 ? STATUS.good.fill : STATUS.critical.fill} />
            ))}
            <LabelList dataKey="change" position="right" formatter={(v: any) => (v > 0 ? `+${v}` : `${v}`)} style={{ fontSize: 12, fill: '#33474D' }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
