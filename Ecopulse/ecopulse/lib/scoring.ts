import type { Hotspot, IndicatorId, Severity, StatusKey, Trend } from './types';

export const STATUS: Record<StatusKey, { label: string; fill: string; text: string }> = {
  good: { label: 'Good', fill: '#2FA37F', text: '#126247' },
  moderate: { label: 'Moderate', fill: '#D9A31E', text: '#6E5006' },
  poor: { label: 'Poor', fill: '#E07A2F', text: '#9A400C' },
  critical: { label: 'Critical', fill: '#CC3A2E', text: '#9C1F16' },
};

/** Score bands for the 0-100 health scale. */
export function statusOf(score: number): StatusKey {
  if (score >= 75) return 'good';
  if (score >= 60) return 'moderate';
  if (score >= 45) return 'poor';
  return 'critical';
}

export function severityOf(localScore: number): Severity {
  if (localScore < 35) return 'critical';
  if (localScore < 50) return 'high';
  if (localScore < 65) return 'moderate';
  return 'low';
}

export const SEVERITY_STATUS: Record<Severity, StatusKey> = {
  low: 'good',
  moderate: 'moderate',
  high: 'poor',
  critical: 'critical',
};
export const SEVERITY_LABEL: Record<Severity, string> = {
  low: 'Low',
  moderate: 'Moderate',
  high: 'High',
  critical: 'Critical',
};

/** Priority = 0.5 x severity + 0.3 x population exposure + 0.2 x trend, each on 0-100. */
export const PRIORITY_WEIGHTS = { severity: 0.5, population: 0.3, trend: 0.2 };
const TREND_POINTS: Record<Trend, number> = { worsening: 100, stable: 50, improving: 0 };

export function priorityParts(h: Hotspot, maxPop: number) {
  return {
    severity: 100 - h.localScore,
    population: (h.population / maxPop) * 100,
    trend: TREND_POINTS[h.trend],
  };
}

export function priorityScore(h: Hotspot, maxPop: number): number {
  const p = priorityParts(h, maxPop);
  return Math.round(
    p.severity * PRIORITY_WEIGHTS.severity + p.population * PRIORITY_WEIGHTS.population + p.trend * PRIORITY_WEIGHTS.trend,
  );
}

export function weightedIndex(values: Record<IndicatorId, number>, weights: { id: IndicatorId; weight: number }[]): number {
  return weights.reduce((sum, w) => sum + values[w.id] * w.weight, 0);
}

/** WHO 2021 24-hour PM2.5 guideline, in micrograms per cubic metre. */
export const WHO_PM25_24H = 15;
/** Demo mapping of real PM2.5 to the 0-100 health scale: 5 or lower scores 100, 75 or higher scores 0. */
export function airScoreFromPm25(pm: number): number {
  return Math.round(Math.max(0, Math.min(100, 100 * (1 - (pm - 5) / 70))));
}
/** Demo mapping of real apparent temperature (deg C) to the 0-100 scale: 24 or lower scores 100, 42 or higher scores 0. */
export function heatScoreFromApparent(t: number): number {
  return Math.round(Math.max(0, Math.min(100, 100 * (1 - (t - 24) / 18))));
}
