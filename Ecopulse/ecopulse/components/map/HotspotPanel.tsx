'use client';

import { ArrowDown, ArrowUp, Minus, MapPin } from 'lucide-react';
import { useStore } from '@/components/Providers';
import { HOTSPOTS } from '@/data/hotspots';
import { DISTRICTS } from '@/data/districts';
import { INDICATOR_BY_ID } from '@/data/indicators';
import { INTERVENTION_BY_ID } from '@/data/interventions';
import { SEVERITY_LABEL, SEVERITY_STATUS, STATUS, severityOf } from '@/lib/scoring';
import { fmt } from '@/lib/format';
import { scrollToId } from '@/lib/scroll';
import { DemoTag, Panel, StatusBadge } from '@/components/ui/primitives';

const TREND_ICON = { worsening: ArrowDown, stable: Minus, improving: ArrowUp } as const;
const TREND_COLOR = { worsening: STATUS.critical.text, stable: '#586B72', improving: STATUS.good.text } as const;

export function HotspotPanel() {
  const { hotspotId, layer, selectHotspot } = useStore();
  const hotspot = HOTSPOTS.find((h) => h.id === hotspotId && h.layer === layer);

  if (!hotspot) {
    const list = HOTSPOTS.filter((h) => h.layer === layer);
    return (
      <Panel className="h-full p-5">
        <h3 className="font-display text-xl font-semibold">Select a hotspot</h3>
        <p className="mt-2 text-sm text-ink-soft">
          Choose a marker on the map, or pick from the {INDICATOR_BY_ID[layer].label.toLowerCase()} hotspots below.
        </p>
        <ul className="mt-4 space-y-2">
          {list.map((h) => {
            const sev = severityOf(h.localScore);
            return (
              <li key={h.id}>
                <button
                  type="button"
                  onClick={() => selectHotspot(h.id)}
                  className="flex w-full items-center justify-between gap-3 rounded border border-line px-3 py-2 text-left text-sm hover:bg-mist"
                >
                  <span className="font-medium">{h.name}</span>
                  <StatusBadge status={SEVERITY_STATUS[sev]}>{SEVERITY_LABEL[sev]}</StatusBadge>
                </button>
              </li>
            );
          })}
        </ul>
      </Panel>
    );
  }

  const sev = severityOf(hotspot.localScore);
  const district = DISTRICTS.find((d) => d.id === hotspot.districtId)!;
  const TrendIcon = TREND_ICON[hotspot.trend];
  const monitorStatus = hotspot.monitoring.status;

  return (
    <Panel className="h-full p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-sm text-ink-mute">
            <MapPin size={14} aria-hidden /> {district.name}, Marlow Basin
          </p>
          <h3 className="mt-1 font-display text-2xl font-semibold leading-tight">{hotspot.name}</h3>
        </div>
        <StatusBadge status={SEVERITY_STATUS[sev]}>{SEVERITY_LABEL[sev]} severity</StatusBadge>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-ink-mute">Indicator</dt>
          <dd className="font-medium">{INDICATOR_BY_ID[hotspot.layer].label}, local score {hotspot.localScore}</dd>
        </div>
        <div>
          <dt className="text-ink-mute">Community affected</dt>
          <dd className="font-medium tabular-nums">About {fmt(hotspot.population)} residents <span className="font-normal text-ink-mute">(demo)</span></dd>
        </div>
        <div className="col-span-2">
          <dt className="text-ink-mute">Trend</dt>
          <dd className="flex items-start gap-1.5 font-medium" style={{ color: TREND_COLOR[hotspot.trend] }}>
            <TrendIcon size={16} className="mt-0.5 shrink-0" aria-hidden />
            <span><span className="capitalize">{hotspot.trend}</span><span className="font-normal text-ink-soft">. {hotspot.trendNote}</span></span>
          </dd>
        </div>
      </dl>

      <div className="mt-5 border-t border-line pt-4">
        <h4 className="text-sm font-semibold">Observed signal</h4>
        <p className="mt-1 text-sm text-ink-soft">{hotspot.signal}</p>
      </div>
      <div className="mt-4">
        <h4 className="text-sm font-semibold">Likely contributing factors</h4>
        <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-ink-soft">
          {hotspot.contributors.map((c) => <li key={c}>{c}</li>)}
        </ul>
      </div>
      <div className="mt-4">
        <h4 className="flex items-center gap-2 text-sm font-semibold">Recommended intervention <DemoTag /></h4>
        <p className="mt-1 text-sm text-ink-soft">
          {hotspot.interventionIds.slice(0, 3).map((id) => INTERVENTION_BY_ID[id].name).join(', ')}.
        </p>
      </div>
      <div className="mt-4">
        <h4 className="flex items-center gap-2 text-sm font-semibold">Expected impact <DemoTag /></h4>
        <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-ink-soft">
          {hotspot.expectedImpact.map((c) => <li key={c}>{c}</li>)}
        </ul>
      </div>
      <div className="mt-4 rounded bg-mist p-3 text-sm">
        <span className="font-semibold">Monitoring: {monitorStatus}.</span> <span className="text-ink-soft">{hotspot.monitoring.note}</span>
      </div>

      <button
        type="button"
        onClick={() => scrollToId('planner')}
        className="mt-5 w-full rounded bg-signal px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#085E5A]"
      >
        Plan action for this hotspot
      </button>
    </Panel>
  );
}
