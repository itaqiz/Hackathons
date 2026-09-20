'use client';

import { useMemo, useState } from 'react';
import { useStore } from '@/components/Providers';
import { GROUPS, optimize, priorityFirst } from '@/lib/optimizer';
import { defaultPlan } from '@/lib/plan';
import { INDICATOR_BY_ID } from '@/data/indicators';
import { scrollToId } from '@/lib/scroll';
import { DemoTag, Panel, Section, Tip } from '@/components/ui/primitives';

const MAX_BUDGET = 40;

export function PortfolioOptimizer() {
  const { plans, createPlan } = useStore();
  const [budget, setBudget] = useState(15);
  const best = useMemo(() => optimize(budget), [budget]);
  const naive = useMemo(() => priorityFirst(budget), [budget]);
  const gain = naive.value > 0 ? Math.round(((best.value - naive.value) / naive.value) * 100) : 0;
  const fresh = best.picks.filter((p) => !plans.some((pl) => pl.hotspotId === p.hotspot.id && pl.interventionId === p.intervention.id));
  const totalOptions = GROUPS.reduce((s, g) => s + g.length, 0);

  const createAll = () => {
    fresh.forEach((p) => createPlan(defaultPlan(p.hotspot, p.intervention)));
    setTimeout(() => scrollToId('community'), 250);
  };

  return (
    <Section
      id="optimizer"
      step={['Prioritize', 'Act']}
      title="Where does limited effort go furthest?"
      intro="Real programmes have a budget. Set an effort budget and EcoPulse selects the mix of interventions, at most one per hotspot, that delivers the most benefit where it matters most."
    >
      <div className="grid gap-6 lg:grid-cols-12">
        <Panel className="p-5 sm:p-6 lg:col-span-4">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="budget" className="text-sm font-semibold">Effort budget</label>
            <output htmlFor="budget" className="font-display text-3xl font-semibold tabular-nums">{budget}</output>
          </div>
          <input id="budget" type="range" min={3} max={MAX_BUDGET} value={budget} onChange={(e) => setBudget(Number(e.target.value))} aria-valuetext={`${budget} effort points`} className="mt-2 h-2 w-full cursor-pointer accent-[#0A716C]" />
          <p className="mt-2 text-xs text-ink-mute">Effort points use the 1 to 5 effort rating of each intervention. <DemoTag /></p>

          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-ink-mute">Optimized portfolio value</dt><dd className="font-semibold tabular-nums">{best.value.toFixed(2)}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-mute">Priority-first baseline</dt><dd className="tabular-nums">{naive.value.toFixed(2)}</dd></div>
            <div className="flex justify-between border-t border-line pt-3"><dt className="font-semibold">Difference</dt><dd className="font-semibold tabular-nums">{gain > 0 ? `+${gain}%` : 'none at this budget'}</dd></div>
          </dl>
          <div className="mt-4 space-y-2" aria-hidden>
            {[['Optimized', best.value, '#0A716C'], ['Priority-first', naive.value, '#9DB0B4']].map(([l, v, c]) => (
              <div key={l as string} className="flex items-center gap-2 text-xs"><span className="w-20 text-ink-mute">{l}</span><span className="h-2 flex-1 rounded-full bg-line"><span className="block h-full rounded-full" style={{ width: `${Math.min(100, ((v as number) / Math.max(best.value, 0.01)) * 100)}%`, backgroundColor: c as string }} /></span></div>
            ))}
          </div>
          <p className="mt-4 text-xs text-ink-mute">
            Method: exact dynamic programming over {GROUPS.length} hotspots and {totalOptions} options (multiple-choice knapsack). Value = hotspot priority x intervention benefit rating.
          </p>
          <button type="button" onClick={createAll} disabled={fresh.length === 0} className="mt-5 w-full rounded bg-signal px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#085E5A] disabled:opacity-50">
            {fresh.length === 0 ? 'All picks already planned' : `Create ${fresh.length} action plan${fresh.length > 1 ? 's' : ''}`}
          </button>
        </Panel>

        <Panel className="p-2 sm:p-4 lg:col-span-8">
          <div className="flex items-center gap-2 px-3 pb-2 pt-2 text-sm font-semibold">
            Selected portfolio: {best.picks.length} interventions, {best.effort} of {budget} effort used
            <Tip label="how the portfolio is chosen">The solver compares every combination the budget allows and keeps the one with the highest total value. Greedy ranking can miss better combinations, for example one costly option versus two cheap options that together help more people.</Tip>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <caption className="sr-only">Interventions selected for the chosen effort budget</caption>
              <thead><tr className="border-b border-line text-ink-mute"><th scope="col" className="px-3 py-2 font-medium">Hotspot</th><th scope="col" className="px-3 py-2 font-medium">Intervention</th><th scope="col" className="px-3 py-2 text-right font-medium">Priority</th><th scope="col" className="px-3 py-2 text-right font-medium">Effort</th><th scope="col" className="px-3 py-2 text-right font-medium">Value</th></tr></thead>
              <tbody>
                {best.picks.map((p) => (
                  <tr key={p.hotspot.id} className="border-b border-line/70">
                    <th scope="row" className="px-3 py-2.5 text-left font-normal"><span className="block font-medium">{p.hotspot.name}</span><span className="text-xs text-ink-mute">{INDICATOR_BY_ID[p.hotspot.layer].label}</span></th>
                    <td className="px-3 py-2.5">{p.intervention.name}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{p.priority}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{p.cost}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{p.value.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {best.picks.length === 0 && <p className="p-4 text-sm text-ink-soft">The budget is too small for any intervention.</p>}
        </Panel>
      </div>
    </Section>
  );
}
