import type { Hotspot, Intervention } from './types';
import { HOTSPOTS, MAX_HOTSPOT_POP } from '@/data/hotspots';
import { INTERVENTION_BY_ID } from '@/data/interventions';
import { priorityScore } from './scoring';

export interface Candidate {
  hotspot: Hotspot;
  intervention: Intervention;
  priority: number;
  /** Priority (0-1) x benefit rating (1-5). Higher means more benefit where it matters most. */
  value: number;
  cost: number;
}

/** One group per hotspot: its suggested interventions. At most one is chosen per hotspot. */
export function buildGroups(): Candidate[][] {
  return HOTSPOTS.map((h) => {
    const priority = priorityScore(h, MAX_HOTSPOT_POP);
    return h.interventionIds.map((id) => {
      const iv = INTERVENTION_BY_ID[id];
      return { hotspot: h, intervention: iv, priority, value: (priority / 100) * iv.benefit, cost: iv.effort };
    });
  });
}

export const GROUPS = buildGroups();

export interface Portfolio { picks: Candidate[]; effort: number; value: number }

const total = (picks: Candidate[]): Portfolio => ({
  picks,
  effort: picks.reduce((s, p) => s + p.cost, 0),
  value: Math.round(picks.reduce((s, p) => s + p.value, 0) * 100) / 100,
});

/**
 * Multiple-choice knapsack solved exactly by dynamic programming: pick at most one intervention per
 * hotspot to maximise total value within an effort budget. O(groups x budget x options).
 */
export function optimize(budget: number): Portfolio {
  const G = GROUPS.length;
  const dp: number[][] = Array.from({ length: G + 1 }, () => new Array(budget + 1).fill(0));
  const choice: number[][] = Array.from({ length: G + 1 }, () => new Array(budget + 1).fill(-1));
  for (let g = 1; g <= G; g++) {
    for (let b = 0; b <= budget; b++) {
      dp[g][b] = dp[g - 1][b];
      GROUPS[g - 1].forEach((c, k) => {
        if (c.cost <= b && dp[g - 1][b - c.cost] + c.value > dp[g][b] + 1e-9) {
          dp[g][b] = dp[g - 1][b - c.cost] + c.value;
          choice[g][b] = k;
        }
      });
    }
  }
  const picks: Candidate[] = [];
  let b = budget;
  for (let g = G; g >= 1; g--) {
    const k = choice[g][b];
    if (k >= 0) { const c = GROUPS[g - 1][k]; picks.push(c); b -= c.cost; }
  }
  return total(picks.sort((a, z) => z.priority - a.priority));
}

/** Naive baseline: go down the priority ranking and take each hotspot's first suggestion while it fits. */
export function priorityFirst(budget: number): Portfolio {
  const order = [...GROUPS].sort((a, z) => z[0].priority - a[0].priority);
  const picks: Candidate[] = [];
  let left = budget;
  for (const g of order) {
    const c = g[0];
    if (c.cost <= left) { picks.push(c); left -= c.cost; }
  }
  return total(picks);
}
