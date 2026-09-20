'use client';

import { useState } from 'react';
import { useStore } from '@/components/Providers';
import { INDICATORS, INDICATOR_BY_ID, CURRENT, SERIES } from '@/data/indicators';
import { PERIOD_LABEL, changeOver } from '@/lib/series';
import { statusOf } from '@/lib/scoring';
import type { Period } from '@/lib/types';
import { Change, Panel, Section, Segmented } from '@/components/ui/primitives';
import { ChangeChart } from '@/components/charts/ChangeChart';
import { TrendChart } from '@/components/charts/TrendChart';
import { IndexCard } from './IndexCard';
import { IndicatorCard } from './IndicatorCard';
import { LivePanel } from './LivePanel';
import { TransparencyPanel } from './TransparencyPanel';

type Filter = 'all' | 'attention' | 'worsening' | 'improving';

export function Dashboard() {
  const { period, setPeriod, selectedIndicator } = useStore();
  const [filter, setFilter] = useState<Filter>('all');

  const visible = INDICATORS.filter((i) => {
    const ch = changeOver(SERIES[i.id], period).points;
    if (filter === 'attention') return ['poor', 'critical'].includes(statusOf(CURRENT[i.id]));
    if (filter === 'worsening') return ch < -0.05;
    if (filter === 'improving') return ch > 0.05;
    return true;
  });
  const sel = INDICATOR_BY_ID[selectedIndicator];
  const selCh = changeOver(SERIES[sel.id], period);

  return (
    <Section
      id="pulse"
      step="Sense"
      title="Environmental pulse"
      intro="Six indicators, one index, and the change over the period you choose. Every number carries a plain-language meaning and a recommended action."
    >
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Segmented<Period>
          label="Time period"
          value={period}
          onChange={setPeriod}
          options={[
            { value: '30d', label: '30 days' },
            { value: '90d', label: '90 days' },
            { value: '12m', label: '12 months' },
          ]}
        />
        <Segmented<Filter>
          label="Indicator filter"
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'All' },
            { value: 'attention', label: 'Needs attention' },
            { value: 'worsening', label: 'Worsening' },
            { value: 'improving', label: 'Improving' },
          ]}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-5"><IndexCard period={period} /></div>
        <Panel className="p-5 sm:p-6 lg:col-span-7">
          <h3 className="font-display text-xl font-semibold">What moved in the last {PERIOD_LABEL[period]}?</h3>
          <p className="mt-1 text-sm text-ink-soft">Change in score points. Bars to the left of zero mean conditions got worse.</p>
          <div className="mt-4"><ChangeChart period={period} /></div>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((i) => <IndicatorCard key={i.id} def={i} period={period} />)}
      </div>
      {visible.length === 0 && (
        <Panel className="mt-6 p-6 text-sm text-ink-soft">No indicators match this filter for the selected period. Choose another filter or period.</Panel>
      )}

      <div id="trend" className="mt-6 grid scroll-mt-20 gap-6 lg:grid-cols-12">
        <Panel className="p-5 sm:p-6 lg:col-span-8">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="font-display text-xl font-semibold">{sel.label} trend</h3>
              <p className="mt-1 text-sm text-ink-soft">Weekly demo series. Dashed lines mark the Critical (45) and Moderate (60) thresholds.</p>
            </div>
            <Change points={selCh.points} percent={selCh.percent} suffix={`over ${PERIOD_LABEL[period]}`} />
          </div>
          <div className="mt-4"><TrendChart values={SERIES[sel.id]} period={period} name={sel.label} /></div>
        </Panel>
        <Panel className="p-5 sm:p-6 lg:col-span-4">
          <h3 className="font-display text-xl font-semibold">Data transparency</h3>
          <div className="mt-4"><TransparencyPanel /></div>
        </Panel>
      </div>

      <div className="mt-6"><LivePanel /></div>
    </Section>
  );
}
