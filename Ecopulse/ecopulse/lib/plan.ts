import type { Hotspot, Intervention, Plan } from './types';

export const TIMEFRAMES = ['3 months', '6 months', '12 months'];
export const CADENCES = ['Weekly', 'Monthly', 'Quarterly'];

export function defaultPlan(h: Hotspot, i: Intervention): Omit<Plan, 'id'> {
  return {
    title: `${i.name} at ${h.name}`,
    hotspotId: h.id,
    interventionId: i.id,
    owner: '',
    timeframe: '6 months',
    cadence: 'Monthly',
    baseline: h.localScore,
    target: Math.min(100, h.localScore + i.benefit * 3),
  };
}
