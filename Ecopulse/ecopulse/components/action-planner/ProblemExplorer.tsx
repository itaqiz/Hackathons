'use client';

import { useState } from 'react';
import { useStore } from '@/components/Providers';
import { RANKED_HOTSPOTS } from '@/data/hotspots';
import { DISTRICTS } from '@/data/districts';
import { INDICATOR_BY_ID } from '@/data/indicators';
import { INTERVENTION_BY_ID } from '@/data/interventions';
import { PRIORITY_WEIGHTS, SEVERITY_LABEL, SEVERITY_STATUS, STATUS, priorityParts, severityOf } from '@/lib/scoring';
import { MAX_HOTSPOT_POP } from '@/data/hotspots';
import { scrollToId } from '@/lib/scroll';
import { fmt } from '@/lib/format';
import type { IndicatorId } from '@/lib/types';
import { DemoTag, Panel, Section, Segmented, StatusBadge, Tip } from '@/components/ui/primitives';

const CATS: { value: 'all' | IndicatorId; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'heat', label: 'Heat' },
  { value: 'air', label: 'Air' },
  { value: 'water', label: 'Water' },
  { value: 'waste', label: 'Waste' },
  { value: 'green', label: 'Green cover' },
  { value: 'bio', label: 'Biodiversity' },
];

export function ProblemExplorer() {
  const { hotspotId, selectHotspot } = useStore();
  const [cat, setCat] = useState<'all' | IndicatorId>('all');
  const list = RANKED_HOTSPOTS.filter((r) => cat === 'all' || r.hotspot.layer === cat);
  const shown = list.find((r) => r.hotspot.id === hotspotId) ?? list[0];
  const h = shown.hotspot;
  const sev = severityOf(h.localScore);
  const parts = priorityParts(h, MAX_HOTSPOT_POP);
  const district = DISTRICTS.find((d) => d.id === h.districtId)!;

  return (
    <Section
      id="pressure"
      step="Prioritize"
      title="Find the pressure points"
      intro="Hotspots ranked by a transparent priority score, so the first place to act is a calculation you can inspect rather than a guess."
    >
      <div className="mb-5">
        <Segmented label="Problem category" value={cat} onChange={setCat} options={CATS} />
      </div>
      <div className="grid gap-6 lg:grid-cols-12">
        <Panel className="p-2 lg:col-span-5">
          <div className="flex items-center gap-2 px-3 pb-1 pt-3 text-sm font-semibold">
            Priority ranking
            <Tip label="the priority score">
              Priority = 50% severity (100 minus local score) + 30% population exposed (relative to the largest hotspot) + 20% trend (worsening 100, stable 50, improving 0).
            </Tip>
          </div>
          <ol className="p-1">
            {list.map((r, idx) => {
              const s = severityOf(r.hotspot.localScore);
              const active = r.hotspot.id === h.id;
              return (
                <li key={r.hotspot.id}>
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => selectHotspot(r.hotspot.id)}
                    className={`grid w-full grid-cols-[1.5rem_1fr_auto] items-center gap-x-3 rounded px-3 py-2.5 text-left ${active ? 'bg-mist' : 'hover:bg-mist/60'}`}
                  >
                    <span className="text-sm tabular-nums text-ink-mute">{idx + 1}</span>
                    <span>
                      <span className="block text-sm font-medium">{r.hotspot.name}</span>
                      <span className="mt-1 block h-1.5 rounded-full bg-line" aria-hidden>
                        <span className="block h-full rounded-full" style={{ width: `${r.priority}%`, backgroundColor: STATUS[SEVERITY_STATUS[s]].fill }} />
                      </span>
                    </span>
                    <span className="text-right">
                      <span className="block text-lg font-semibold leading-none tabular-nums">{r.priority}</span>
                      <span className="text-xs text-ink-mute">priority</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </Panel>

        <Panel className="p-5 sm:p-6 lg:col-span-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm text-ink-mute">{INDICATOR_BY_ID[h.layer].label} in {district.name}</p>
              <h3 className="font-display text-2xl font-semibold leading-tight">{h.name}</h3>
            </div>
            <StatusBadge status={SEVERITY_STATUS[sev]}>Severity: {SEVERITY_LABEL[sev]}</StatusBadge>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <h4 className="text-sm font-semibold">Observed signal</h4>
              <p className="mt-1 text-sm text-ink-soft">{h.signal}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold">Potential contributors</h4>
              <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-ink-soft">{h.contributors.map((c) => <li key={c}>{c}</li>)}</ul>
            </div>
            <div>
              <h4 className="flex items-center gap-2 text-sm font-semibold">Recommended intervention <DemoTag /></h4>
              <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-ink-soft">{h.interventionIds.slice(0, 3).map((id) => <li key={id}>{INTERVENTION_BY_ID[id].name}</li>)}</ul>
            </div>
            <div>
              <h4 className="flex items-center gap-2 text-sm font-semibold">Expected impact <DemoTag /></h4>
              <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-ink-soft">{h.expectedImpact.map((c) => <li key={c}>{c}</li>)}</ul>
            </div>
          </div>

          <div className="mt-6 rounded bg-mist p-4">
            <h4 className="text-sm font-semibold">Why it ranks {list.findIndex((r) => r.hotspot.id === h.id) + 1} of {list.length}: priority {shown.priority}</h4>
            <dl className="mt-3 space-y-2 text-sm">
              {([
                ['Severity', parts.severity, PRIORITY_WEIGHTS.severity, `local score ${h.localScore}`],
                ['Population exposed', parts.population, PRIORITY_WEIGHTS.population, `about ${fmt(h.population)} residents`],
                ['Trend', parts.trend, PRIORITY_WEIGHTS.trend, h.trend],
              ] as const).map(([label, v, w, note]) => (
                <div key={label} className="grid grid-cols-[9rem_1fr_auto] items-center gap-3">
                  <dt>{label} <span className="text-ink-mute">({Math.round(w * 100)}%)</span></dt>
                  <dd className="h-1.5 rounded-full bg-white" aria-hidden><span className="block h-full rounded-full bg-signal" style={{ width: `${v}%` }} /></dd>
                  <dd className="text-right text-xs text-ink-soft">{Math.round(v)}, {note}</dd>
                </div>
              ))}
            </dl>
          </div>

          <button
            type="button"
            onClick={() => { selectHotspot(h.id); setTimeout(() => scrollToId('planner'), 80); }}
            className="mt-5 rounded bg-signal px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#085E5A]"
          >
            Plan action for this pressure point
          </button>
        </Panel>
      </div>
    </Section>
  );
}
