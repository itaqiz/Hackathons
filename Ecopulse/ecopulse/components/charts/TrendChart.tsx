'use client';

import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Period } from '@/lib/types';
import { PERIOD_LABEL, sliceFor } from '@/lib/series';

/** Score over the selected period. Axis is fixed at 0-100 so slopes are not exaggerated. */
export function TrendChart({ values, period, name }: { values: number[]; period: Period; name: string }) {
  const slice = sliceFor(values, period);
  const data = slice.map((v, i) => ({ label: i === slice.length - 1 ? 'now' : `${slice.length - 1 - i}w ago`, value: v }));
  return (
    <div
      className="h-64 w-full"
      role="img"
      aria-label={`${name} score over the last ${PERIOD_LABEL[period]}, from ${slice[0]} to ${slice[slice.length - 1]} out of 100`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: -12 }}>
          <CartesianGrid stroke="#E3EAEB" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#586B72' }} interval="preserveStartEnd" minTickGap={32} />
          <YAxis domain={[0, 100]} ticks={[0, 45, 60, 75, 100]} tick={{ fontSize: 12, fill: '#586B72' }} />
          <ReferenceLine y={45} stroke="#CC3A2E" strokeDasharray="4 4" />
          <ReferenceLine y={60} stroke="#D9A31E" strokeDasharray="4 4" />
          <Tooltip
            formatter={(v: any) => [`${v} out of 100`, name]}
            contentStyle={{ borderRadius: 6, border: '1px solid #D1DBDC', fontSize: 13 }}
          />
          <Line type="monotone" dataKey="value" stroke="#0A716C" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
