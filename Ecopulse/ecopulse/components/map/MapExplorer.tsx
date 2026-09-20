'use client';

import { useState } from 'react';
import { useStore } from '@/components/Providers';
import { LiveDistrictPanel } from './LiveDistrictPanel';
import { liveScore, liveScoreMap } from '@/lib/liveScores';
import { districtCenter } from '@/lib/live';
import { HOTSPOTS } from '@/data/hotspots';
import { DISTRICTS } from '@/data/districts';
import { INDICATOR_BY_ID } from '@/data/indicators';
import { STATUS, statusOf } from '@/lib/scoring';
import type { IndicatorId } from '@/lib/types';
import { Panel, Section, Segmented, StatusBadge } from '@/components/ui/primitives';
import { RegionSvg } from './RegionSvg';
import { HotspotPanel } from './HotspotPanel';

const LAYERS: { value: IndicatorId; label: string }[] = [
  { value: 'air', label: 'Air quality' },
  { value: 'heat', label: 'Heat' },
  { value: 'water', label: 'Water stress' },
  { value: 'waste', label: 'Waste' },
  { value: 'green', label: 'Green coverage' },
  { value: 'bio', label: 'Biodiversity' },
];

export function MapExplorer() {
  const { layer, setLayer, hotspotId, selectHotspot, regional } = useStore();
  const [liveSel, setLiveSel] = useState<string | null>(null);
  const override = liveScoreMap(regional, layer);
  const liveOn = Boolean(regional && override);
  const hotspots = liveOn ? [] : HOTSPOTS.filter((h) => h.layer === layer);
  const scoreOf = (d: (typeof DISTRICTS)[number]) => override?.[d.id] ?? d.scores[layer];
  const ranked = [...DISTRICTS].sort((a, b) => scoreOf(a) - scoreOf(b));
  const markers = liveOn && regional
    ? regional.points.flatMap((p) => {
        const d = DISTRICTS.find((x) => x.id === p.districtId)!;
        const s = liveScore(layer, p);
        if (s == null) return [];
        const [x, y] = districtCenter(d.points);
        return [{ id: p.districtId, x, y, score: s, label: `${d.name} live ${INDICATOR_BY_ID[layer].label} score ${s}` }];
      })
    : [];

  return (
    <Section
      id="map"
      step="Understand"
      title="Where is it happening, and how serious is it?"
      intro="Marlow Basin is a fictional district built for this demonstration. District colour shows the score for the chosen layer. Markers are hotspots, sized by severity."
    >
      <div className="mb-5">
        <Segmented
          label="Map layer"
          value={layer}
          onChange={setLayer}
          options={LAYERS}
        />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          {liveOn && regional && (
            <p className="rounded-md border border-signal/40 bg-signal/5 p-3 text-sm" role="status">
              <span className="font-semibold">Live data: {regional.place.name}.</span> Six real sample points across about {regional.spanKm} km, modelled grid values from Open-Meteo. Simulated hotspots are hidden on this layer. Other layers stay simulated.
            </p>
          )}
          {regional && !liveOn && (
            <p className="rounded-md border border-line bg-white p-3 text-sm text-ink-soft">Live data for {regional.place.name} covers the Air quality and Heat layers only. This layer is simulated.</p>
          )}
          <Panel className="overflow-hidden">
            <RegionSvg layer={layer} hotspots={hotspots} selectedId={hotspotId} onSelect={selectHotspot} scoreOverride={override} liveMarkers={markers} selectedLiveId={liveSel} onSelectLive={(id) => setLiveSel(id || null)} />
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line px-4 py-3 text-xs text-ink-soft">
              <span className="font-semibold text-ink">{INDICATOR_BY_ID[layer].label}, district score</span>
              {(['critical', 'poor', 'moderate', 'good'] as const).map((k) => (
                <span key={k} className="inline-flex items-center gap-1.5">
                  <span aria-hidden className="h-3 w-3 rounded-sm" style={{ backgroundColor: STATUS[k].fill, opacity: 0.6 }} />
                  {STATUS[k].label} {k === 'critical' ? 'below 45' : k === 'poor' ? '45 to 59' : k === 'moderate' ? '60 to 74' : '75 and above'}
                </span>
              ))}
              <span>{liveOn ? 'Live scores. Layout is the demo map placed over a real area.' : 'Simulated data. Schematic, not to scale.'}</span>
            </div>
          </Panel>
          <Panel className="p-4">
            <h3 className="text-sm font-semibold">Districts ranked, lowest score first{liveOn ? ' (live)' : ''}</h3>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {ranked.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-3 rounded bg-mist px-3 py-2 text-sm">
                  <span>{d.name}</span>
                  <span className="flex items-center gap-2">
                    <span className="font-semibold tabular-nums">{scoreOf(d)}</span>
                    <StatusBadge status={statusOf(scoreOf(d))} />
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
        <div id="hotspot-detail" className="scroll-mt-20">
          {liveOn && regional ? <LiveDistrictPanel live={regional} layer={layer} selectedId={liveSel} onSelect={(id) => setLiveSel(id || null)} /> : <HotspotPanel />}
        </div>
      </div>
    </Section>
  );
}
