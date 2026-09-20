import type { Lever } from '@/lib/types';

/**
 * Linear demonstration coefficients: score points gained per 1 unit of lever.
 * They are authored for illustration and are not derived from research.
 */
export const LEVERS: Lever[] = [
  {
    id: 'canopy', label: 'Tree canopy increase', unit: '%', min: 0, max: 30, step: 1,
    description: 'Extra tree canopy cover across the region.',
    effects: { heat: 0.5, green: 0.6, air: 0.15, bio: 0.2 }, carbon: 0.8,
  },
  {
    id: 'waste', label: 'Waste diversion', unit: '%', min: 0, max: 60, step: 1,
    description: 'Share of waste diverted from dumping into segregation, compost and recycling.',
    effects: { waste: 0.5, air: 0.1, water: 0.05, bio: 0.05 }, carbon: 0.3,
  },
  {
    id: 'water', label: 'Water conservation', unit: '%', min: 0, max: 30, step: 1,
    description: 'Reduction in water lost or used beyond need.',
    effects: { water: 0.7, bio: 0.15 }, carbon: 0.1,
  },
  {
    id: 'renewable', label: 'Renewable energy adoption', unit: '%', min: 0, max: 50, step: 1,
    description: 'Share of local energy use switched to renewable sources.',
    effects: { air: 0.25, heat: 0.05 }, carbon: 0.6,
  },
];

export const ZERO_LEVERS = { canopy: 0, waste: 0, water: 0, renewable: 0 };
