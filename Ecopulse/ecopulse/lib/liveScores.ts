import type { LivePoint, RegionalLive } from './live';
import type { IndicatorId } from './types';
import { airScoreFromPm25, heatScoreFromApparent } from './scoring';

export const LIVE_LAYERS: IndicatorId[] = ['air', 'heat'];

export function liveScore(layer: IndicatorId, p: LivePoint): number | null {
  if (layer === 'air') return p.pm25 != null ? airScoreFromPm25(p.pm25) : null;
  if (layer === 'heat') return p.feelsLike != null ? heatScoreFromApparent(p.feelsLike) : null;
  return null;
}

/** District id to live score for a layer, or undefined when live data does not cover that layer. */
export function liveScoreMap(live: RegionalLive | null, layer: IndicatorId): Record<string, number> | undefined {
  if (!live || !LIVE_LAYERS.includes(layer)) return undefined;
  const out: Record<string, number> = {};
  for (const p of live.points) {
    const s = liveScore(layer, p);
    if (s != null) out[p.districtId] = s;
  }
  return Object.keys(out).length ? out : undefined;
}

export function liveMean(live: RegionalLive | null, layer: IndicatorId): number | null {
  const m = liveScoreMap(live, layer);
  if (!m) return null;
  const v = Object.values(m);
  return Math.round(v.reduce((s, x) => s + x, 0) / v.length);
}
