'use client';

import type { Hotspot, IndicatorId } from '@/lib/types';
import { DISTRICTS, GREEN_PATCHES, REGION, RIVER_PATH, ROADS } from '@/data/districts';
import { INDICATOR_BY_ID } from '@/data/indicators';
import { SEVERITY_LABEL, SEVERITY_STATUS, STATUS, severityOf, statusOf } from '@/lib/scoring';

const RADIUS = { critical: 13, high: 11, moderate: 9, low: 7 } as const;

interface Props {
  layer: IndicatorId;
  hotspots: Hotspot[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  dark?: boolean;
  /** Real scores per district id. When set they replace the simulated district scores for this layer. */
  scoreOverride?: Record<string, number>;
  liveMarkers?: { id: string; x: number; y: number; score: number; label: string }[];
  selectedLiveId?: string | null;
  onSelectLive?: (id: string) => void;
}

/** Schematic SVG map of the fictional Marlow Basin. No tiles, no API keys. */
export function RegionSvg({ layer, hotspots, selectedId, onSelect, dark, scoreOverride, liveMarkers = [], selectedLiveId, onSelectLive }: Props) {
  const c = dark
    ? { bg: '#0B2229', grid: '#12313A', border: '#2A4B54', road: '#1C3D47', river: '#2E6F86', label: '#A9C4CA', halo: '#0B2229', fillOp: 0.42 }
    : { bg: '#F7FAFA', grid: '#E6EDEE', border: '#9FB0B3', road: '#DDE6E7', river: '#8FC3DA', label: '#26393F', halo: '#F7FAFA', fillOp: 0.3 };
  const interactive = Boolean(onSelect);
  const ind = INDICATOR_BY_ID[layer];

  return (
    <svg
      viewBox={`0 0 ${REGION.width} ${REGION.height}`}
      className="h-auto w-full"
      role={interactive ? 'group' : 'img'}
      aria-label={`Schematic map of ${REGION.name}, a fictional demonstration district, showing ${ind.label} by district with ${hotspots.length} hotspots`}
    >
      <defs>
        <pattern id={`grid-${dark ? 'd' : 'l'}`} width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" fill="none" stroke={c.grid} strokeWidth="1" />
        </pattern>
      </defs>
      <rect width={REGION.width} height={REGION.height} fill={c.bg} />
      <rect width={REGION.width} height={REGION.height} fill={`url(#grid-${dark ? 'd' : 'l'})`} />

      {DISTRICTS.map((d) => {
        const score = scoreOverride?.[d.id] ?? d.scores[layer];
        const s = STATUS[statusOf(score)];
        return (
          <polygon key={d.id} points={d.points} fill={s.fill} fillOpacity={c.fillOp} stroke={c.border} strokeWidth="1.5" strokeLinejoin="round">
            <title>{`${d.name}: ${ind.label} score ${score} (${s.label})${scoreOverride ? ', live' : ''}`}</title>
          </polygon>
        );
      })}

      {ROADS.map((r) => (
        <path key={r} d={r} fill="none" stroke={c.road} strokeWidth="4" strokeLinecap="round" />
      ))}
      {GREEN_PATCHES.map((g, i) => (
        <ellipse key={i} cx={g.cx} cy={g.cy} rx={g.rx} ry={g.ry} fill="#3E9C7E" fillOpacity={dark ? 0.35 : 0.3} />
      ))}
      <path d={RIVER_PATH} fill="none" stroke={c.river} strokeWidth="16" strokeLinecap="round" opacity="0.9" />

      {DISTRICTS.map((d) => (
        <text
          key={d.id}
          x={d.label[0]}
          y={d.label[1]}
          textAnchor="middle"
          fontSize="13"
          fontWeight="600"
          fill={c.label}
          stroke={c.halo}
          strokeWidth="3.5"
          paintOrder="stroke"
          aria-hidden
        >
          {d.name}
        </text>
      ))}

      {hotspots.map((h) => {
        const sev = severityOf(h.localScore);
        const fill = STATUS[SEVERITY_STATUS[sev]].fill;
        const r = RADIUS[sev];
        const selected = selectedId === h.id;
        const pulses = sev === 'critical' || sev === 'high';
        const inner = (
          <>
            {pulses && <circle className="pulse-ring" r={r} fill={fill} opacity="0.45" />}
            <circle className="hs-ring" r={r + 7} fill="none" stroke={dark ? '#fff' : '#0B1B20'} strokeWidth="2.5" opacity={selected ? 1 : 0} />
            <circle r={r} fill={fill} stroke="#fff" strokeWidth="2.5" />
            <circle r="2.5" fill="#fff" />
          </>
        );
        if (!interactive) return <g key={h.id} transform={`translate(${h.x} ${h.y})`} aria-hidden>{inner}</g>;
        return (
          <g
            key={h.id}
            className="hs cursor-pointer"
            transform={`translate(${h.x} ${h.y})`}
            role="button"
            tabIndex={0}
            aria-pressed={selected}
            aria-label={`${h.name}. ${SEVERITY_LABEL[sev]} severity, ${ind.label}, local score ${h.localScore}`}
            onClick={() => onSelect?.(h.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect?.(h.id);
              }
            }}
          >
            <title>{`${h.name}: ${SEVERITY_LABEL[sev]} severity`}</title>
            {/* larger invisible target for touch */}
            <circle r={r + 12} fill="transparent" />
            {inner}
          </g>
        );
      })}
      {liveMarkers.map((m) => {
        const s = STATUS[statusOf(m.score)];
        const sel = selectedLiveId === m.id;
        return (
          <g
            key={m.id}
            className="hs cursor-pointer"
            transform={`translate(${m.x} ${m.y})`}
            role="button"
            tabIndex={0}
            aria-pressed={sel}
            aria-label={m.label}
            onClick={() => onSelectLive?.(m.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectLive?.(m.id); }
            }}
          >
            <circle r="26" fill="transparent" />
            <circle className="hs-ring" r="24" fill="none" stroke="#0B1B20" strokeWidth="2.5" opacity={sel ? 1 : 0} />
            <rect x="-19" y="-14" width="38" height="28" rx="5" fill={s.fill} stroke="#fff" strokeWidth="2.5" />
            <text textAnchor="middle" y="5" fontSize="15" fontWeight="700" fill="#fff" stroke="#0B1B20" strokeWidth="2.2" paintOrder="stroke">{m.score}</text>
          </g>
        );
      })}
    </svg>
  );
}
