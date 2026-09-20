import type { IndicatorId, LeverId } from './types';
import { CURRENT, CURRENT_INDEX, INDICATORS } from '@/data/indicators';
import { LEVERS } from '@/data/scenarios';
import { weightedIndex } from './scoring';
import { round1 } from './series';

/** Indicators where an improvement shows as the measure going up. For the rest the pressure goes down. */
export const RISES: IndicatorId[] = ['green', 'bio'];

/**
 * Additive linear scenario. Each lever adds (level x coefficient) score points to the indicators it touches,
 * capped at 100. The carbon index is a separate 0-100 relative measure. Demonstration assumptions only.
 */
export function runScenario(levels: Record<LeverId, number>) {
  const after = { ...CURRENT };
  let carbon = 0;
  for (const lever of LEVERS) {
    const level = levels[lever.id] ?? 0;
    carbon += level * lever.carbon;
    for (const [ind, coef] of Object.entries(lever.effects) as [IndicatorId, number][]) {
      after[ind] = Math.min(100, after[ind] + level * coef);
    }
  }
  const index = round1(weightedIndex(after, INDICATORS));
  const deltas = Object.fromEntries(INDICATORS.map((i) => [i.id, round1(after[i.id] - CURRENT[i.id])])) as Record<IndicatorId, number>;
  return { before: CURRENT, after, index, indexBefore: CURRENT_INDEX, indexDelta: round1(index - CURRENT_INDEX), deltas, carbon: Math.min(100, Math.round(carbon)) };
}
