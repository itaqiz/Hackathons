import type { Intervention } from '@/lib/types';

const S = {
  s2: 'SDG 2 Zero hunger',
  s3: 'SDG 3 Good health',
  s6: 'SDG 6 Clean water',
  s7: 'SDG 7 Clean energy',
  s11: 'SDG 11 Sustainable cities',
  s12: 'SDG 12 Responsible consumption',
  s13: 'SDG 13 Climate action',
  s15: 'SDG 15 Life on land',
};

/** All effort, benefit and time values are demonstration estimates, not validated predictions. */
export const INTERVENTIONS: Intervention[] = [
  // Heat
  { id: 'canopy', layer: 'heat', name: 'Tree canopy expansion', summary: 'Plant shade trees along streets and plazas where surface temperatures are highest.', effort: 3, benefit: 5, timeToImpact: '3 to 5 years as trees mature', area: 'Neighbourhood', sdg: [S.s11, S.s13, S.s15], monitoring: ['Surface-temperature anomaly', 'Canopy cover share', 'Planting survival rate'], lever: { id: 'canopy', amount: 10 } },
  { id: 'cool-roofs', layer: 'heat', name: 'Cool roofs', summary: 'Coat or replace dark roofs with reflective material.', effort: 2, benefit: 3, timeToImpact: '1 to 3 months', area: 'Building blocks', sdg: [S.s11, S.s13], monitoring: ['Roof surface temperature', 'Indoor temperature survey', 'Roofs treated'] },
  { id: 'shade-routes', layer: 'heat', name: 'Shaded pedestrian routes', summary: 'Add awnings, shade structures and planting along walking routes to transit and schools.', effort: 2, benefit: 3, timeToImpact: '6 to 12 months', area: 'Corridors', sdg: [S.s3, S.s11], monitoring: ['Shade share along routes', 'Midday route temperature'] },
  { id: 'pocket-parks', layer: 'heat', name: 'Pocket green spaces', summary: 'Convert small vacant or paved plots into shaded green rest spaces.', effort: 4, benefit: 3, timeToImpact: '1 to 3 years', area: 'Single plots', sdg: [S.s11, S.s15], monitoring: ['Plots converted', 'Local surface temperature', 'Visitor counts'], lever: { id: 'canopy', amount: 4 } },
  // Air
  { id: 'freight-mgmt', layer: 'air', name: 'Freight routing and idling limits', summary: 'Reroute heavy vehicles away from housing and enforce idling limits at loading points.', effort: 3, benefit: 4, timeToImpact: '3 to 9 months', area: 'Corridor', sdg: [S.s3, S.s11], monitoring: ['Heavy-vehicle counts', 'Idling hours', 'Particulate readings (needs monitors)'] },
  { id: 'clean-kilns', layer: 'air', name: 'Cleaner kiln technology', summary: 'Help small kilns move to cleaner fuels and better combustion.', effort: 4, benefit: 4, timeToImpact: '1 to 2 years', area: 'Site cluster', sdg: [S.s3, S.s7, S.s13], monitoring: ['Kilns converted', 'Fuel use per batch', 'Downwind smoke reports'], lever: { id: 'renewable', amount: 15 } },
  { id: 'green-buffers', layer: 'air', name: 'Roadside green buffers', summary: 'Plant dense vegetation strips between busy roads and housing.', effort: 2, benefit: 2, timeToImpact: '2 to 4 years', area: 'Road edges', sdg: [S.s3, S.s15], monitoring: ['Buffer length planted', 'Roadside particulate readings (needs monitors)'], lever: { id: 'canopy', amount: 3 } },
  // Water
  { id: 'leak-repair', layer: 'water', name: 'Distribution leak repair', summary: 'Find and repair the leakiest mains and connections, starting with the highest-loss zones.', effort: 3, benefit: 4, timeToImpact: '6 to 18 months', area: 'District network', sdg: [S.s6, S.s11], monitoring: ['Share of water lost', 'Supply gap hours', 'Repairs completed'], lever: { id: 'water', amount: 10 } },
  { id: 'precision-irrigation', layer: 'water', name: 'Drip and precision irrigation', summary: 'Replace flood irrigation with drip or scheduled irrigation on the most water-hungry farms.', effort: 3, benefit: 4, timeToImpact: 'One growing season', area: 'Farmland', sdg: [S.s2, S.s6], monitoring: ['Water use per hectare', 'Farms converted', 'Canal shortfall days'], lever: { id: 'water', amount: 15 } },
  { id: 'household-retrofits', layer: 'water', name: 'Household water-saving retrofits', summary: 'Fit low-flow taps and fix leaks in homes, with a household water audit.', effort: 2, benefit: 3, timeToImpact: '3 to 6 months', area: 'Households', sdg: [S.s6, S.s12], monitoring: ['Households retrofitted', 'Metered household use'], lever: { id: 'water', amount: 8 } },
  // Waste
  { id: 'segregation', layer: 'waste', name: 'Source segregation and doorstep collection', summary: 'Give households separate bins and a reliable collection round so waste stops going to informal dumps.', effort: 3, benefit: 5, timeToImpact: '3 to 6 months', area: 'Neighbourhood', sdg: [S.s11, S.s12], monitoring: ['Households enrolled', 'Share of waste diverted', 'Dumping recurrence'], lever: { id: 'waste', amount: 20 } },
  { id: 'compost-hubs', layer: 'waste', name: 'Neighbourhood composting hubs', summary: 'Process market and household organic waste locally.', effort: 2, benefit: 3, timeToImpact: '2 to 4 months', area: 'Single sites', sdg: [S.s12, S.s13], monitoring: ['Organic waste processed', 'Overflow days at transfer point'], lever: { id: 'waste', amount: 10 } },
  { id: 'dump-clearance', layer: 'waste', name: 'Clearance with recurrence controls', summary: 'Clear informal dumps and pair each clearance with fencing, signage and a collection point.', effort: 3, benefit: 3, timeToImpact: '1 to 2 months', area: 'Single sites', sdg: [S.s11, S.s15], monitoring: ['Sites cleared', 'Recurrence within 90 days'], lever: { id: 'waste', amount: 8 } },
  // Green
  { id: 'street-trees', layer: 'green', name: 'Street tree corridors', summary: 'Plant continuous rows of street trees where planting strips can be created.', effort: 3, benefit: 4, timeToImpact: '2 to 5 years', area: 'Corridors', sdg: [S.s11, S.s13, S.s15], monitoring: ['Trees planted', 'Survival rate', 'Canopy cover share'], lever: { id: 'canopy', amount: 10 } },
  { id: 'school-grounds', layer: 'green', name: 'School-ground planting', summary: 'Replace paved school areas with trees and planting beds, with student involvement.', effort: 2, benefit: 3, timeToImpact: '1 to 3 years', area: 'School sites', sdg: [S.s11, S.s15], monitoring: ['Sites planted', 'Vegetation cover on site'], lever: { id: 'canopy', amount: 5 } },
  { id: 'vacant-lot-gardens', layer: 'green', name: 'Vacant-lot community gardens', summary: 'Turn unused lots into shared gardens managed by residents.', effort: 2, benefit: 3, timeToImpact: '6 to 12 months', area: 'Single plots', sdg: [S.s2, S.s11], monitoring: ['Lots converted', 'Active gardeners', 'Vegetation cover on site'], lever: { id: 'canopy', amount: 4 } },
  // Biodiversity
  { id: 'wetland-edge', layer: 'bio', name: 'Wetland edge restoration', summary: 'Stop dumping at the edge, replant native edge vegetation and fence the most damaged sections.', effort: 4, benefit: 4, timeToImpact: '2 to 4 years', area: 'Habitat edge', sdg: [S.s15, S.s13], monitoring: ['Edge length restored', 'Native plant cover', 'Survey species list'] },
  { id: 'pollinator-strips', layer: 'bio', name: 'Hedgerow and pollinator strips', summary: 'Restore field-margin hedgerows and flowering strips that link habitat patches.', effort: 2, benefit: 3, timeToImpact: '1 to 2 seasons', area: 'Farm margins', sdg: [S.s2, S.s15], monitoring: ['Margin length restored', 'Pollinator counts'], lever: { id: 'canopy', amount: 3 } },
  { id: 'community-survey', layer: 'bio', name: 'Community biodiversity survey', summary: 'Set up a simple repeatable survey so change can be measured.', effort: 1, benefit: 2, timeToImpact: 'Baseline within weeks', area: 'Survey sites', sdg: [S.s15], monitoring: ['Survey rounds completed', 'Species recorded'] },
];

export const INTERVENTION_BY_ID = Object.fromEntries(INTERVENTIONS.map((i) => [i.id, i]));
