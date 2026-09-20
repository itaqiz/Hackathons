import type { CommunityAction } from '@/lib/types';

/** Demonstration community actions. Participant counts and progress are simulated. */
export const COMMUNITY_ACTIONS: CommunityAction[] = [
  { id: 'act-cleanup', title: 'Riverside dump cleanup', layer: 'waste', districtId: 'riverside', participants: 46, status: 'Active', target: 12, current: 7, unit: 'sites cleared', step: 1, note: 'Each cleared site gets a collection point to reduce re-dumping.' },
  { id: 'act-water', title: 'Water conservation campaign', layer: 'water', districtId: 'market', participants: 120, status: 'Active', target: 800, current: 310, unit: 'households pledged', step: 25, note: 'Household pledges to fix leaks and cut use.' },
  { id: 'act-trees', title: 'Market Ward tree planting', layer: 'green', districtId: 'market', participants: 84, status: 'Active', target: 600, current: 180, unit: 'trees planted', step: 20, note: 'Priority on school blocks and the transit plaza approach.' },
  { id: 'act-survey', title: 'Wetland edge species survey', layer: 'bio', districtId: 'riverside', participants: 18, status: 'Planning', target: 6, current: 0, unit: 'survey rounds', step: 1, note: 'Builds the baseline that restoration will be measured against.' },
  { id: 'act-recycling', title: 'Doorstep recycling pilot', layer: 'waste', districtId: 'oldquarter', participants: 63, status: 'Active', target: 1500, current: 620, unit: 'households enrolled', step: 50, note: 'Separate bins and a fixed weekly collection round.' },
  { id: 'act-heat', title: 'Heat-risk awareness network', layer: 'heat', districtId: 'oldquarter', participants: 40, status: 'Completed', target: 40, current: 40, unit: 'cool-spot hosts', step: 5, note: 'Shops and community rooms open as cool spots in heat alerts.' },
];
