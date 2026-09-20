import type { Period } from './types';

export const PERIOD_POINTS: Record<Period, number> = { '30d': 5, '90d': 13, '12m': 52 };
export const PERIOD_LABEL: Record<Period, string> = { '30d': '30 days', '90d': '90 days', '12m': '12 months' };

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

/**
 * Deterministic weekly demo series (52 points). The last point equals `end`, the first equals
 * `end - yearChange`. Seasonal wobble and small noise are added in between. Simulated, not measured.
 */
export function buildSeries(end: number, yearChange: number, amp: number, seed: number, n = 52): number[] {
  const start = end - yearChange;
  const r = rng(seed);
  return Array.from({ length: n }, (_, i) => {
    if (i === 0) return round1(start);
    if (i === n - 1) return round1(end);
    const t = i / (n - 1);
    const base = start + (end - start) * t;
    const season = Math.sin(t * Math.PI * 2) * amp;
    const noise = (r() - 0.5) * 1.4;
    return round1(Math.max(0, Math.min(100, base + season + noise)));
  });
}

export const round1 = (n: number) => Math.round(n * 10) / 10;

export function sliceFor(values: number[], period: Period) {
  return values.slice(-PERIOD_POINTS[period]);
}

export function changeOver(values: number[], period: Period) {
  const s = sliceFor(values, period);
  const points = round1(s[s.length - 1] - s[0]);
  const percent = s[0] === 0 ? 0 : round1((points / s[0]) * 100);
  return { points, percent };
}
