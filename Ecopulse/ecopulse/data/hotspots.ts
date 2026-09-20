import type { Hotspot } from '@/lib/types';
import { priorityScore } from '@/lib/scoring';

export const HOTSPOTS: Hotspot[] = [
  // Heat
  {
    id: 'heat-1', name: 'Market Ward transit plaza', layer: 'heat', districtId: 'market', x: 690, y: 262,
    localScore: 28, population: 8200, trend: 'worsening',
    trendNote: 'Score has drifted down through the demo year as paved area grew.',
    signal: 'High surface-temperature anomaly on a fully paved plaza with almost no shade.',
    contributors: ['Low tree canopy', 'Dense built environment', 'Limited shade at bus stops', 'Dark paving and roofing'],
    interventionIds: ['canopy', 'shade-routes', 'cool-roofs', 'pocket-parks'],
    expectedImpact: ['Reduced heat exposure at the plaza and approach streets', 'Improved thermal comfort for people waiting for transit', 'Higher green coverage in Market Ward'],
    monitoring: { status: 'Baseline recorded', note: 'Demo baseline set. No follow-up readings yet.' },
  },
  {
    id: 'heat-2', name: 'Old Quarter bazaar lanes', layer: 'heat', districtId: 'oldquarter', x: 290, y: 270,
    localScore: 33, population: 6400, trend: 'worsening',
    trendNote: 'Narrow lanes trap heat; the score has slipped over the demo year.',
    signal: 'Elevated night-time heat retention in tightly built lanes.',
    contributors: ['Dense masonry and metal roofing', 'Narrow lanes with little airflow', 'No street trees'],
    interventionIds: ['cool-roofs', 'shade-routes', 'pocket-parks'],
    expectedImpact: ['Lower roof and lane surface temperatures', 'More comfortable walking routes at midday'],
    monitoring: { status: 'Not yet monitored', note: 'No baseline recorded for this location.' },
  },
  {
    id: 'heat-3', name: 'Northgate rooftop cluster', layer: 'heat', districtId: 'northgate', x: 110, y: 100,
    localScore: 44, population: 1900, trend: 'stable',
    trendNote: 'Roughly flat across the demo year.',
    signal: 'Large dark industrial roofs raise local surface temperatures.',
    contributors: ['Large unshaded roof area', 'Little vegetation on site'],
    interventionIds: ['cool-roofs', 'canopy'],
    expectedImpact: ['Lower roof surface temperature', 'Reduced cooling load inside the buildings'],
    monitoring: { status: 'Not yet monitored', note: 'No baseline recorded for this location.' },
  },
  // Air
  {
    id: 'air-1', name: 'Northgate freight corridor', layer: 'air', districtId: 'northgate', x: 250, y: 110,
    localScore: 38, population: 5400, trend: 'worsening',
    trendNote: 'Heavy-vehicle traffic has grown through the demo year.',
    signal: 'Sustained particulate and traffic pollution along the main freight route.',
    contributors: ['Heavy-vehicle volume and idling', 'Unpaved shoulders raising dust', 'Housing built close to the road'],
    interventionIds: ['freight-mgmt', 'green-buffers'],
    expectedImpact: ['Lower pollution exposure for homes beside the corridor', 'Fewer idling hours at loading points'],
    monitoring: { status: 'Baseline recorded', note: 'Demo baseline set. Would need physical monitors for real readings.' },
  },
  {
    id: 'air-2', name: 'Old Quarter junction', layer: 'air', districtId: 'oldquarter', x: 480, y: 225,
    localScore: 54, population: 7100, trend: 'stable',
    trendNote: 'Steady, with peaks at commuting hours.',
    signal: 'Congestion-related pollution peaks at a busy junction.',
    contributors: ['Stop-start traffic', 'Street canyon effect from tall frontages'],
    interventionIds: ['freight-mgmt', 'green-buffers'],
    expectedImpact: ['Smoother traffic flow at peak hours', 'Slightly lower roadside exposure'],
    monitoring: { status: 'Not yet monitored', note: 'No baseline recorded for this location.' },
  },
  {
    id: 'air-3', name: 'Hillcrest kiln cluster', layer: 'air', districtId: 'hillcrest', x: 650, y: 100,
    localScore: 46, population: 2300, trend: 'stable',
    trendNote: 'Roughly flat across the demo year.',
    signal: 'Smoke from a group of small kilns drifts over nearby homes.',
    contributors: ['Older kiln technology', 'Solid-fuel burning', 'Prevailing wind toward housing'],
    interventionIds: ['clean-kilns', 'green-buffers'],
    expectedImpact: ['Lower smoke exposure downwind', 'Reduced fuel use per batch'],
    monitoring: { status: 'Not yet monitored', note: 'No baseline recorded for this location.' },
  },
  // Water
  {
    id: 'water-1', name: 'Southfield irrigation canal', layer: 'water', districtId: 'southfield', x: 300, y: 420,
    localScore: 36, population: 3100, trend: 'worsening',
    trendNote: 'Canal supply is falling short of farm demand more often.',
    signal: 'Farm irrigation demand regularly exceeds canal supply.',
    contributors: ['Flood irrigation', 'Seepage from unlined canal sections', 'Rising dry-season demand'],
    interventionIds: ['precision-irrigation', 'leak-repair'],
    expectedImpact: ['Less water lost per hectare irrigated', 'More reliable supply for downstream farms'],
    monitoring: { status: 'Baseline recorded', note: 'Demo baseline set. No follow-up readings yet.' },
  },
  {
    id: 'water-2', name: 'Riverside pumping zone', layer: 'water', districtId: 'riverside', x: 150, y: 250,
    localScore: 45, population: 4800, trend: 'stable',
    trendNote: 'Intermittent supply, roughly flat.',
    signal: 'Households report intermittent pressure and long supply gaps.',
    contributors: ['Ageing pipes', 'Uneven pumping schedules', 'High household leakage'],
    interventionIds: ['leak-repair', 'household-retrofits'],
    expectedImpact: ['Fewer supply gaps', 'Lower household water use'],
    monitoring: { status: 'Not yet monitored', note: 'No baseline recorded for this location.' },
  },
  {
    id: 'water-3', name: 'Market Ward distribution loss', layer: 'water', districtId: 'market', x: 645, y: 290,
    localScore: 52, population: 5200, trend: 'stable',
    trendNote: 'Steady, with losses concentrated in older mains.',
    signal: 'A large share of supplied water is lost before reaching taps.',
    contributors: ['Leaking mains', 'Unmetered connections'],
    interventionIds: ['leak-repair', 'household-retrofits'],
    expectedImpact: ['More water reaching households', 'Lower pumping demand'],
    monitoring: { status: 'Not yet monitored', note: 'No baseline recorded for this location.' },
  },
  // Waste
  {
    id: 'waste-1', name: 'Riverside informal dump', layer: 'waste', districtId: 'riverside', x: 95, y: 270,
    localScore: 34, population: 3900, trend: 'worsening',
    trendNote: 'Dumping keeps returning after one-off clearances.',
    signal: 'Recurring uncontrolled dumping next to the river edge.',
    contributors: ['No doorstep collection nearby', 'Mixed waste with no segregation', 'Cleared sites get re-dumped'],
    interventionIds: ['segregation', 'dump-clearance', 'compost-hubs'],
    expectedImpact: ['Less waste reaching the river edge', 'Lower dumping recurrence after clearance'],
    monitoring: { status: 'Baseline recorded', note: 'Demo baseline set. No follow-up readings yet.' },
  },
  {
    id: 'waste-2', name: 'Market Ward transfer point', layer: 'waste', districtId: 'market', x: 735, y: 225,
    localScore: 47, population: 6100, trend: 'stable',
    trendNote: 'Overflows at market close, otherwise steady.',
    signal: 'Market waste overflows the transfer point most evenings.',
    contributors: ['High organic waste from stalls', 'Collection frequency lower than volume'],
    interventionIds: ['compost-hubs', 'segregation'],
    expectedImpact: ['Less organic waste in mixed collection', 'Fewer overflow days'],
    monitoring: { status: 'Not yet monitored', note: 'No baseline recorded for this location.' },
  },
  // Green
  {
    id: 'green-1', name: 'Old Quarter canopy gap', layer: 'green', districtId: 'oldquarter', x: 330, y: 285,
    localScore: 30, population: 5600, trend: 'stable',
    trendNote: 'Very little change; there is almost nothing left to lose.',
    signal: 'Block-level vegetation cover far below the demo target.',
    contributors: ['Fully built plots', 'No planting strips', 'Few street trees'],
    interventionIds: ['street-trees', 'vacant-lot-gardens', 'school-grounds'],
    expectedImpact: ['More shaded frontage', 'Higher vegetation cover on the block'],
    monitoring: { status: 'Not yet monitored', note: 'No baseline recorded for this location.' },
  },
  {
    id: 'green-2', name: 'Market Ward school blocks', layer: 'green', districtId: 'market', x: 610, y: 235,
    localScore: 40, population: 4300, trend: 'improving',
    trendNote: 'A small planting round has started to lift cover.',
    signal: 'School grounds are bare and paved with little vegetation.',
    contributors: ['Paved playgrounds', 'No tree planting programme'],
    interventionIds: ['school-grounds', 'street-trees'],
    expectedImpact: ['Shaded play areas', 'Higher vegetation cover around the schools'],
    monitoring: { status: 'Monitoring active', note: 'Demo planting round is being tracked in the community board.' },
  },
  {
    id: 'green-3', name: 'Northgate housing blocks', layer: 'green', districtId: 'northgate', x: 70, y: 115,
    localScore: 46, population: 2600, trend: 'stable',
    trendNote: 'Flat across the demo year.',
    signal: 'Housing blocks with no green space between buildings.',
    contributors: ['Unused vacant lots', 'No planting policy for new blocks'],
    interventionIds: ['vacant-lot-gardens', 'street-trees'],
    expectedImpact: ['Usable green space for residents', 'Higher vegetation cover'],
    monitoring: { status: 'Not yet monitored', note: 'No baseline recorded for this location.' },
  },
  // Biodiversity
  {
    id: 'bio-1', name: 'Riverside wetland edge', layer: 'bio', districtId: 'riverside', x: 125, y: 300,
    localScore: 41, population: 1500, trend: 'worsening',
    trendNote: 'Edge habitat is shrinking as dumping and building creep in.',
    signal: 'Wetland edge habitat is fragmenting and has almost no survey coverage.',
    contributors: ['Dumping at the wetland edge', 'Development pressure', 'No regular survey'],
    interventionIds: ['wetland-edge', 'community-survey'],
    expectedImpact: ['Slower habitat loss at the edge', 'A survey baseline to measure against'],
    monitoring: { status: 'Not yet monitored', note: 'No baseline recorded for this location.' },
  },
  {
    id: 'bio-2', name: 'Southfield hedgerow loss', layer: 'bio', districtId: 'southfield', x: 520, y: 460,
    localScore: 48, population: 1200, trend: 'stable',
    trendNote: 'Loss has slowed but not reversed.',
    signal: 'Field boundaries have lost hedgerows, breaking habitat links between patches.',
    contributors: ['Field consolidation', 'Herbicide use on margins'],
    interventionIds: ['pollinator-strips', 'community-survey'],
    expectedImpact: ['Reconnected habitat between patches', 'More pollinator habitat on farm margins'],
    monitoring: { status: 'Not yet monitored', note: 'No baseline recorded for this location.' },
  },
];

export const MAX_HOTSPOT_POP = Math.max(...HOTSPOTS.map((h) => h.population));

export const RANKED_HOTSPOTS = [...HOTSPOTS]
  .map((h) => ({ hotspot: h, priority: priorityScore(h, MAX_HOTSPOT_POP) }))
  .sort((a, b) => b.priority - a.priority);

export const TOP_HOTSPOT = RANKED_HOTSPOTS[0].hotspot;
export const HOTSPOT_BY_ID = Object.fromEntries(HOTSPOTS.map((h) => [h.id, h]));
