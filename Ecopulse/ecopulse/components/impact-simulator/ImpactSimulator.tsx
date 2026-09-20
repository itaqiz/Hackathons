'use client';

import { useMemo } from 'react';
import { ArrowDown, ArrowRight, ArrowUp } from 'lucide-react';
import { useStore } from '@/components/Providers';
import { LEVERS } from '@/data/scenarios';
import { INDICATORS, INDICATOR_BY_ID } from '@/data/indicators';
import { RISES, runScenario } from '@/lib/scenario';
import { STATUS, statusOf } from '@/lib/scoring';
import { signed } from '@/lib/format';
import { Panel, Section } from '@/components/ui/primitives';
import { ScenarioChart } from '@/components/charts/ScenarioChart';

export function ImpactSimulator() {
  const { levers, setLever, resetLevers, loadIntervention, selectedIntervention: sel, activeHotspot: h } = useStore();
  const r = useMemo(() => runScenario(levers), [levers]);
  const active = LEVERS.filter((l) => levers[l.id] > 0);
  const changed = INDICATORS.filter((i) => Math.abs(r.deltas[i.id]) > 0.04);

  const flow = [
    { k: 'Data', v: `${INDICATOR_BY_ID[h.layer].label} at ${h.name}` },
    { k: 'Intervention', v: sel ? sel.name : 'None selected yet' },
    { k: 'Scenario', v: active.length ? active.map((l) => `${l.label} +${levers[l.id]}%`).join(', ') : 'No levers moved' },
    { k: 'Impact', v: `Index ${r.indexBefore.toFixed(1)} to ${r.index.toFixed(1)}` },
  ];

  return (
    <Section
      id="simulator"
      step="Act"
      title="What happens if we act?"
      intro="Move the levers and see how the demonstration indicators respond. The point is to compare options, not to predict a number."
    >
      <ol className="mb-6 grid gap-2 sm:grid-cols-4" aria-label="Simulation flow">
        {flow.map((f, i) => (
          <li key={f.k} className="relative rounded-md border border-line bg-white p-3">
            <p className="text-xs font-semibold text-signal">{f.k}</p>
            <p className="mt-0.5 text-sm">{f.v}</p>
            {i < flow.length - 1 && <ArrowRight aria-hidden size={16} className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-mist text-ink-mute sm:block" />}
          </li>
        ))}
      </ol>

      <p className="mb-6 rounded-md border-l-4 border-[#D9A31E] bg-white p-4 text-sm font-medium">
        Scenario simulation, not a forecast. Coefficients are demonstration assumptions, listed at the bottom of this section.
      </p>

      <div className="grid gap-6 lg:grid-cols-12">
        <Panel className="p-5 sm:p-6 lg:col-span-5">
          <h3 className="font-display text-xl font-semibold">Intervention levels</h3>
          <div className="mt-5 space-y-6">
            {LEVERS.map((l) => (
              <div key={l.id}>
                <div className="flex items-baseline justify-between gap-3">
                  <label htmlFor={`lever-${l.id}`} className="text-sm font-semibold">{l.label}</label>
                  <output htmlFor={`lever-${l.id}`} className="font-display text-2xl font-semibold tabular-nums">+{levers[l.id]}{l.unit}</output>
                </div>
                <input
                  id={`lever-${l.id}`}
                  type="range"
                  min={l.min}
                  max={l.max}
                  step={l.step}
                  value={levers[l.id]}
                  onChange={(e) => setLever(l.id, Number(e.target.value))}
                  aria-valuetext={`plus ${levers[l.id]} percent`}
                  className="mt-2 h-2 w-full cursor-pointer accent-[#0A716C]"
                />
                <p className="mt-1 text-xs text-ink-mute">{l.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-2 border-t border-line pt-4">
            <button
              type="button"
              disabled={!sel?.lever}
              onClick={() => loadIntervention(sel)}
              className="rounded border border-line px-3 py-2 text-sm font-semibold hover:bg-mist disabled:cursor-not-allowed disabled:opacity-50"
            >
              Load selected intervention
            </button>
            <button type="button" onClick={resetLevers} className="rounded border border-line px-3 py-2 text-sm font-semibold hover:bg-mist">Reset levels</button>
          </div>
          {!sel?.lever && <p className="mt-2 text-xs text-ink-mute">Select an intervention with a scenario lever in the Action Planner to load it here.</p>}
        </Panel>

        <div id="scenario-results" className="scroll-mt-20 space-y-6 lg:col-span-7">
          <Panel className="p-5 sm:p-6">
            <h3 className="font-display text-xl font-semibold">Scenario result</h3>
            <div className="mt-4 flex flex-wrap items-end gap-x-8 gap-y-3">
              <div>
                <p className="text-sm text-ink-mute">Index now</p>
                <p className="font-display text-4xl font-semibold tabular-nums text-ink-soft">{r.indexBefore.toFixed(1)}</p>
              </div>
              <ArrowRight aria-hidden className="mb-3 text-ink-mute" />
              <div>
                <p className="text-sm text-ink-mute">Index in this scenario</p>
                <p className="font-display text-5xl font-semibold tabular-nums" style={{ color: STATUS[statusOf(r.index)].text }}>{r.index.toFixed(1)}</p>
              </div>
              <p className="pb-2 text-lg font-semibold tabular-nums" style={{ color: r.indexDelta > 0 ? STATUS.good.text : '#586B72' }}>{signed(r.indexDelta)} pts</p>
            </div>
            <div className="mt-5"><ScenarioChart before={r.before} after={r.after} /></div>
          </Panel>

          <div className="grid gap-6 sm:grid-cols-2">
            <Panel className="p-5">
              <h3 className="text-sm font-semibold">Projected demonstration effect</h3>
              {changed.length === 0 ? (
                <p className="mt-2 text-sm text-ink-soft">Move a lever to see which indicators respond.</p>
              ) : (
                <ul className="mt-3 space-y-1.5 text-sm" aria-live="polite">
                  {changed.map((i) => {
                    const rises = RISES.includes(i.id);
                    const Icon = rises ? ArrowUp : ArrowDown;
                    return (
                      <li key={i.id} className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-1.5"><Icon size={15} aria-hidden style={{ color: STATUS.good.text }} />{i.pressureLabel}</span>
                        <span className="tabular-nums text-ink-soft">{signed(r.deltas[i.id])} pts</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Panel>
            <Panel className="p-5">
              <h3 className="text-sm font-semibold">Relative carbon benefit index</h3>
              <p className="mt-1 text-xs text-ink-mute">0 to 100, a demo measure of relative climate benefit across levers.</p>
              <p className="mt-3 font-display text-3xl font-semibold tabular-nums">{r.carbon}</p>
              <div className="mt-2 h-2 rounded-full bg-line" role="progressbar" aria-valuenow={r.carbon} aria-valuemin={0} aria-valuemax={100} aria-label="Relative carbon benefit index">
                <div className="h-full rounded-full bg-signal transition-all" style={{ width: `${r.carbon}%` }} />
              </div>
            </Panel>
          </div>
        </div>
      </div>

      <details className="mt-6 rounded-md border border-line bg-white p-4 text-sm">
        <summary className="cursor-pointer font-semibold">Model coefficients (demonstration assumptions)</summary>
        <p className="mt-3 text-ink-soft">Score points gained per 1% of lever. Effects add together and each score is capped at 100.</p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left">
            <thead>
              <tr className="border-b border-line text-ink-mute">
                <th className="py-2 font-medium" scope="col">Lever</th>
                {INDICATORS.map((i) => <th key={i.id} className="py-2 text-right font-medium" scope="col">{i.label}</th>)}
                <th className="py-2 text-right font-medium" scope="col">Carbon index</th>
              </tr>
            </thead>
            <tbody>
              {LEVERS.map((l) => (
                <tr key={l.id} className="border-b border-line/70">
                  <th scope="row" className="py-2 font-normal">{l.label}</th>
                  {INDICATORS.map((i) => <td key={i.id} className="py-2 text-right tabular-nums">{l.effects[i.id] ?? '0'}</td>)}
                  <td className="py-2 text-right tabular-nums">{l.carbon}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </Section>
  );
}
