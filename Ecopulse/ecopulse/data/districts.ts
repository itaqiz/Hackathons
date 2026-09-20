import type { District } from '@/lib/types';

/** Fictional demonstration region. Geometry is schematic and not to scale. */
export const REGION = {
  name: 'Marlow Basin',
  descriptor: 'Fictional demonstration district',
  width: 800,
  height: 560,
};

export const DISTRICTS: District[] = [
  {
    id: 'northgate',
    name: 'Northgate Industrial',
    population: 14200,
    points: '20,20 340,20 360,150 200,190 20,170',
    label: [180, 55],
    scores: { air: 48, water: 58, waste: 52, heat: 42, green: 46, bio: 55 },
  },
  {
    id: 'hillcrest',
    name: 'Hillcrest',
    population: 9800,
    points: '340,20 780,20 780,140 560,170 360,150',
    label: [560, 55],
    scores: { air: 64, water: 70, waste: 68, heat: 61, green: 72, bio: 74 },
  },
  {
    id: 'oldquarter',
    name: 'Old Quarter',
    population: 21500,
    points: '200,190 360,150 560,170 540,310 190,310',
    label: [300, 215],
    scores: { air: 60, water: 52, waste: 58, heat: 33, green: 38, bio: 50 },
  },
  {
    id: 'riverside',
    name: 'Riverside Flats',
    population: 12600,
    points: '20,170 200,190 190,310 20,320',
    label: [100, 215],
    scores: { air: 66, water: 42, waste: 40, heat: 45, green: 50, bio: 48 },
  },
  {
    id: 'market',
    name: 'Market Ward',
    population: 18300,
    points: '560,170 780,140 780,330 540,310',
    label: [655, 190],
    scores: { air: 58, water: 46, waste: 47, heat: 30, green: 40, bio: 58 },
  },
  {
    id: 'southfield',
    name: 'Southfield Farms',
    population: 8400,
    points: '20,320 190,310 540,310 780,330 780,540 20,540',
    label: [400, 505],
    scores: { air: 80, water: 38, waste: 66, heat: 62, green: 70, bio: 52 },
  },
];

export const RIVER_PATH = 'M0,300 C150,260 250,340 400,300 S650,250 800,330';

export const ROADS = [
  'M0,110 C200,140 400,100 800,80',
  'M370,0 C380,150 360,350 390,560',
  'M0,240 C200,230 500,250 800,230',
  'M560,170 C580,300 570,420 600,560',
];

export const GREEN_PATCHES = [
  { cx: 420, cy: 235, rx: 52, ry: 32 },
  { cx: 620, cy: 90, rx: 78, ry: 34 },
  { cx: 125, cy: 292, rx: 46, ry: 14 },
  { cx: 240, cy: 450, rx: 70, ry: 30 },
];
