'use client';

import { MapPin } from 'lucide-react';
import type { IndicatorId } from '@/lib/types';
import type { RegionalLive } from '@/lib/live';
import { DISTRICTS } from '@/data/districts';
import { INDICATOR_BY_ID } from '@/data/indicators';
import { liveScore } from '@/lib/liveScores';
import { WHO_PM25_24H, statusOf } from '@/lib/scoring';
import { Panel, StatusBadge } from '@/components/ui/primitives';

export function LiveDistrictPanel({ live, layer, selectedId, onSelect }: { live: RegionalLive; layer: IndicatorId; selectedId: string | null; onSelect: (id: string) => void }) {
  const ind = INDICATOR_BY_ID[layer];
  const p = live.points.find((x) => x.districtId === selectedId);
  const district = DISTRICTS.find((d) => d.id === selectedId);

  if (!p || !district) {
    return (
      <Panel className="h-full p-5">
        <h3 className="font-display text-xl font-semibold">Live {ind.label.toLowerCase()} by sample point</h3>
        <p className="mt-2 text-sm text-ink-soft">Select a marker, or a district below, to see the real values at its sample point.</p>
        <ul className="mt-4 space-y-2">
          {live.points.map((pt) => {
            const s = liveScore(layer, pt);
            const d = DISTRICTS.find((x) => x.id === pt.districtId)!;
            return (
              <li key={pt.districtId}>
                <button type="button" onClick={() => onSelect(pt.districtId)} className="flex w-full items-center justify-between gap-3 rounded border border-line px-3 py-2 text-left text-sm hover:bg-mist">
                  <span className="font-medium">{d.name}</span>
                  {s != null ? <StatusBadge status={statusOf(s)}>{s}</StatusBadge> : <span className="text-ink-mute">n/a</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </Panel>
    );
  }

  const score = liveScore(layer, p);
  return (
    <Panel className="h-full p-5">
      <p className="flex items-center gap-1.5 text-sm text-ink-mute"><MapPin size={14} aria-hidden /> Sample point at {p.lat.toFixed(3)}, {p.lon.toFixed(3)}</p>
      <div className="mt-1 flex items-start justify-between gap-3">
        <h3 className="font-display text-2xl font-semibold leading-tight">{district.name} <span className="text-base font-normal text-ink-mute">(demo district)</span></h3>
        {score != null && <StatusBadge status={statusOf(score)}>{ind.label} {score}</StatusBadge>}
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded bg-mist p-3"><dt className="text-xs text-ink-mute">PM2.5</dt><dd className="text-xl font-semibold tabular-nums">{p.pm25 != null ? p.pm25.toFixed(1) : 'n/a'} <span className="text-sm font-normal text-ink-mute">µg/m³</span></dd>{p.pm25 != null && <dd className="text-xs text-ink-soft">{(p.pm25 / WHO_PM25_24H).toFixed(1)} times the WHO 24-hour guideline</dd>}</div>
        <div className="rounded bg-mist p-3"><dt className="text-xs text-ink-mute">US AQI</dt><dd className="text-xl font-semibold tabular-nums">{p.usAqi != null ? Math.round(p.usAqi) : 'n/a'}</dd></div>
        <div className="col-span-2 rounded bg-mist p-3"><dt className="text-xs text-ink-mute">Feels-like temperature</dt><dd className="text-xl font-semibold tabular-nums">{p.feelsLike != null ? p.feelsLike.toFixed(1) : 'n/a'} <span className="text-sm font-normal text-ink-mute">°C</span></dd></div>
      </dl>
      <p className="mt-4 text-sm text-ink-soft">
        These values belong to a real point near {live.place.name}. The district name is only the demo layout placed over it. Open-Meteo grid cells are several kilometres wide, so nearby points can share almost the same value.
      </p>
      <p className="mt-3 text-xs text-ink-mute">Observation time, local to the place: {live.time ?? 'not provided'}.</p>
      <button type="button" onClick={() => onSelect('')} className="mt-4 rounded border border-line px-3 py-1.5 text-sm font-semibold hover:bg-mist">Back to all points</button>
    </Panel>
  );
}
