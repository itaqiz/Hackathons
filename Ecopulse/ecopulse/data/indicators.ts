import type { IndicatorDef, IndicatorId } from '@/lib/types';
import { buildSeries, round1 } from '@/lib/series';
import { weightedIndex } from '@/lib/scoring';
import { DISTRICTS } from './districts';

/** Every score is on a 0-100 health scale where higher is better. Weights sum to 1. */
export const INDICATORS: IndicatorDef[] = [
  {
    id: 'air',
    label: 'Air quality',
    weight: 0.2,
    proxy: 'Demo composite of particulate and traffic-related pollution',
    meaning: 'How clean the air is where people live and work, scaled 0-100. A higher score means cleaner air.',
    action: 'Cut exposure at the freight corridor and the kiln cluster first. They reach the most people.',
    yearChange: -5,
    seasonAmp: 1.8,
    seed: 11,
    pressureLabel: 'Air pollution exposure',
  },
  {
    id: 'water',
    label: 'Water stress',
    weight: 0.2,
    proxy: 'Demo composite of supply reliability and irrigation demand against availability',
    meaning: 'How well local water supply covers household and farm demand, scaled 0-100. A higher score means lower stress.',
    action: 'Repair distribution losses and move farm irrigation to precision methods.',
    yearChange: -6,
    seasonAmp: 2.4,
    seed: 23,
    pressureLabel: 'Water stress',
  },
  {
    id: 'waste',
    label: 'Waste pressure',
    weight: 0.15,
    proxy: 'Demo composite of collection coverage and uncontrolled dumping',
    meaning: 'How much waste is collected and handled versus dumped or left, scaled 0-100. A higher score means less pressure.',
    action: 'Start doorstep segregation where dumping keeps returning.',
    yearChange: 3,
    seasonAmp: 1.2,
    seed: 37,
    pressureLabel: 'Waste pressure',
  },
  {
    id: 'heat',
    label: 'Heat risk',
    weight: 0.2,
    proxy: 'Demo composite of surface-temperature anomaly and available shade',
    meaning: 'How exposed residents are to dangerous heat, scaled 0-100. A higher score means lower risk.',
    action: 'Add shade and canopy where paving is dense and exposed residents are most numerous.',
    yearChange: -4,
    seasonAmp: 2.8,
    seed: 41,
    pressureLabel: 'Heat exposure',
  },
  {
    id: 'green',
    label: 'Green coverage',
    weight: 0.15,
    proxy: 'Demo measure of tree and vegetation cover against a demo neighbourhood target',
    meaning: 'How much tree and vegetation cover a district has relative to its target, scaled 0-100. A higher score means more cover.',
    action: 'Plant along school grounds and street corridors in the lowest-coverage blocks.',
    yearChange: 1,
    seasonAmp: 1.5,
    seed: 53,
    pressureLabel: 'Green coverage',
  },
  {
    id: 'bio',
    label: 'Biodiversity signal',
    weight: 0.1,
    proxy: 'Demo signal of habitat continuity and survey coverage',
    meaning: 'A rough signal of habitat continuity and species-survey coverage, scaled 0-100. A higher score means healthier ecosystems.',
    action: 'Protect wetland edges and restore hedgerow links before more habitat is lost.',
    yearChange: -2,
    seasonAmp: 1.0,
    seed: 67,
    pressureLabel: 'Biodiversity signal',
  },
];

export const INDICATOR_BY_ID = Object.fromEntries(INDICATORS.map((i) => [i.id, i])) as Record<IndicatorId, IndicatorDef>;

export const TOTAL_POPULATION = DISTRICTS.reduce((s, d) => s + d.population, 0);

/** Population-weighted mean of district scores. This is how city-level values are derived. */
function popMean(id: IndicatorId) {
  return DISTRICTS.reduce((s, d) => s + d.scores[id] * d.population, 0) / TOTAL_POPULATION;
}

export const SERIES = Object.fromEntries(
  INDICATORS.map((i) => [i.id, buildSeries(popMean(i.id), i.yearChange, i.seasonAmp, i.seed)]),
) as Record<IndicatorId, number[]>;

export const INDEX_SERIES: number[] = SERIES.air.map((_, k) => {
  const values = Object.fromEntries(INDICATORS.map((i) => [i.id, SERIES[i.id][k]])) as Record<IndicatorId, number>;
  return round1(weightedIndex(values, INDICATORS));
});

export const CURRENT = Object.fromEntries(
  INDICATORS.map((i) => [i.id, SERIES[i.id][SERIES[i.id].length - 1]]),
) as Record<IndicatorId, number>;

export const CURRENT_INDEX = INDEX_SERIES[INDEX_SERIES.length - 1];
