export type IndicatorId = 'air' | 'water' | 'waste' | 'heat' | 'green' | 'bio';
export type StatusKey = 'good' | 'moderate' | 'poor' | 'critical';
export type Severity = 'low' | 'moderate' | 'high' | 'critical';
export type Trend = 'worsening' | 'stable' | 'improving';
export type Period = '30d' | '90d' | '12m';
export type LeverId = 'canopy' | 'waste' | 'water' | 'renewable';

/** Definition of one environmental indicator. Scores are 0-100, higher = healthier. */
export interface IndicatorDef {
  id: IndicatorId;
  label: string;
  weight: number;
  proxy: string;
  meaning: string;
  action: string;
  /** Demo change in score over 12 months (end minus start). */
  yearChange: number;
  seasonAmp: number;
  seed: number;
  /** Phrase used in the simulator, e.g. "Heat exposure". Falls when the score rises. */
  pressureLabel: string;
}

export interface District {
  id: string;
  name: string;
  population: number;
  points: string;
  label: [number, number];
  scores: Record<IndicatorId, number>;
}

export interface Hotspot {
  id: string;
  name: string;
  layer: IndicatorId;
  districtId: string;
  x: number;
  y: number;
  /** Local health score 0-100 at the hotspot. Severity is derived from it. */
  localScore: number;
  population: number;
  trend: Trend;
  trendNote: string;
  signal: string;
  contributors: string[];
  interventionIds: string[];
  expectedImpact: string[];
  monitoring: { status: 'Not yet monitored' | 'Baseline recorded' | 'Monitoring active'; note: string };
}

export interface Intervention {
  id: string;
  layer: IndicatorId;
  name: string;
  summary: string;
  effort: 1 | 2 | 3 | 4 | 5;
  benefit: 1 | 2 | 3 | 4 | 5;
  timeToImpact: string;
  area: string;
  sdg: string[];
  monitoring: string[];
  /** Closest lever in the demo scenario model, if any. */
  lever?: { id: LeverId; amount: number };
}

export interface CommunityAction {
  id: string;
  title: string;
  layer: IndicatorId;
  districtId: string;
  participants: number;
  status: 'Planning' | 'Active' | 'Completed';
  target: number;
  current: number;
  unit: string;
  step: number;
  note: string;
  fromPlan?: boolean;
}

export interface Plan {
  id: string;
  title: string;
  hotspotId: string;
  interventionId: string;
  owner: string;
  timeframe: string;
  cadence: string;
  baseline: number;
  target: number;
}

export interface Lever {
  id: LeverId;
  label: string;
  description: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  effects: Partial<Record<IndicatorId, number>>;
  carbon: number;
}
