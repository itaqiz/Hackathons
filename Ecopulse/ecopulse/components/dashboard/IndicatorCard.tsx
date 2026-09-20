'use client';

import type { IndicatorDef, Period } from '@/lib/types';
import { CURRENT, SERIES } from '@/data/indicators';
import { PERIOD_LABEL, changeOver, sliceFor } from '@/lib/series';
import { STATUS, statusOf } from '@/lib/scoring';
import { scrollToId } from '@/lib/scroll';
import { useStore } from '@/components/Providers';
import { liveMean } from '@/lib/liveScores';
import { Change, Panel, StatusBadge, Tip } from '@/components/ui/primitives';
import { Sparkline } from '@/components/charts/Sparkline';

export function IndicatorCard({ def, period }: { def: IndicatorDef; period: Period }) {
  const { selectedIndicator, setSelectedIndicator, setLayer, regional } = useStore();
  const liveVal = liveMean(regional, def.id);
  const value = Math.round(CURRENT[def.id]);
  const status = statusOf(CURRENT[def.id]);
  const ch = changeOver(SERIES[def.id], period);
  const selected = selectedIndicator === def.id;

  return (
    <Panel className={`flex flex-col p-5 ${selected ? 'ring-2 ring-signal' : ''}`}>
      <article className="flex h-full flex-col" aria-label={def.label}>
        <div className="flex items-center justify-between gap-2">
          <h3 className="flex items-center gap-1 font-semibold">
            {def.label}
            <Tip label={def.label}>Demo proxy: {def.proxy}. Weight in the index: {Math.round(def.weight * 100)}%.</Tip>
          </h3>
          <StatusBadge status={status} />
        </div>
        <p className="mt-3 flex items-baseline gap-2">
          <span className="font-display text-5xl font-semibold leading-none tabular-nums" style={{ color: STATUS[status].text }}>{value}</span>
          <span className="text-sm text-ink-mute">out of 100</span>
        </p>
        <p className="mt-2"><Change points={ch.points} percent={ch.percent} suffix={`vs ${PERIOD_LABEL[period]} ago`} /></p>
        <div className="mt-3">
          <Sparkline values={sliceFor(SERIES[def.id], period)} color={STATUS[status].fill} label={`${def.label} trend over ${PERIOD_LABEL[period]}`} />
        </div>
        {liveVal != null && regional && (
          <p className="mt-3 rounded bg-signal/5 px-2.5 py-1.5 text-xs text-ink-soft">
            <span className="font-semibold text-signal">Live, {regional.place.name}:</span> {liveVal} out of 100, mean of six real sample points. Not part of the demo index.
          </p>
        )}
        <p className="mt-3 text-sm text-ink-soft">{def.meaning}</p>
        <p className="mt-3 border-t border-line pt-3 text-sm"><span className="font-semibold">Recommended action.</span> <span className="text-ink-soft">{def.action}</span></p>
        <div className="mt-auto flex gap-2 pt-4">
          <button
            type="button"
            aria-pressed={selected}
            onClick={() => { setSelectedIndicator(def.id); scrollToId('trend'); }}
            className="rounded border border-line px-3 py-1.5 text-sm font-medium hover:bg-mist"
          >
            Show trend
          </button>
          <button
            type="button"
            onClick={() => { setLayer(def.id); setSelectedIndicator(def.id); scrollToId('map'); }}
            className="rounded border border-line px-3 py-1.5 text-sm font-medium hover:bg-mist"
          >
            View on map
          </button>
        </div>
      </article>
    </Panel>
  );
}
