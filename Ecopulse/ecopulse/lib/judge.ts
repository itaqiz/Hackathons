export interface JudgeStep {
  title: string;
  say: string;
}

export const JUDGE_STEPS: JudgeStep[] = [
  { title: 'Open EcoPulse', say: 'Communities have environmental data but no clear path from data to action. EcoPulse closes that gap: sense, understand, prioritize, act, measure.' },
  { title: 'Read the environmental pulse', say: 'One transparent index built from six indicators. The change chart shows what is moving the wrong way.' },
  { title: 'Open the map', say: 'A fictional demonstration district. Layers switch between heat, air, water, waste, green cover and biodiversity.' },
  { title: 'Select the highest-risk hotspot', say: 'The transit plaza in Market Ward ranks first on the priority formula: severity, population exposed and trend.' },
  { title: 'Inspect why it matters', say: 'Who is affected, what is driving the problem, and whether anyone is monitoring it yet.' },
  { title: 'Open the Action Planner', say: 'Interventions are matched to this problem. Effort, benefit and time to impact are shown as demonstration estimates.' },
  { title: 'Select an intervention', say: 'Tree canopy expansion has the highest benefit rating here, with medium effort.' },
  { title: 'Open the Impact Simulator', say: 'The chosen intervention loads into the scenario model. Data, intervention, scenario, impact.' },
  { title: 'Change the intervention intensity', say: 'Move the canopy slider. Every coefficient is visible and labeled as a demonstration assumption.' },
  { title: 'Read the scenario change', say: 'Before and after by indicator, plus the index change. This is a scenario, not a forecast.' },
  { title: 'Create the action plan', say: 'Baseline, target, owner and monitoring cadence in one form. Confirm it to add it to the board.' },
  { title: 'Show how impact is monitored', say: 'The plan now sits on the community board with its baseline, target and monitoring indicators. Progress is logged there.' },
];
