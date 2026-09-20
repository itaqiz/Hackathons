'use client';

import { useStore } from '@/components/Providers';
import { RANKED_HOTSPOTS } from '@/data/hotspots';
import { INTERVENTIONS } from '@/data/interventions';
import { INDICATOR_BY_ID } from '@/data/indicators';
import { SEVERITY_LABEL, SEVERITY_STATUS, severityOf } from '@/lib/scoring';
import { scrollToId } from '@/lib/scroll';
import { DemoTag, Meter, Panel, Section, StatusBadge } from '@/components/ui/primitives';
import { InterventionChart } from '@/components/charts/InterventionChart';

export function ActionPlanner() {
  const { activeHotspot: h, hotspotId, selectHotspot, interventionId, selectIntervention, selectedIntervention: sel, loadIntervention, setPlanModalOpen } = useStore();
  const sev = severityOf(h.localScore);
  const items = INTERVENTIONS.filter((i) => i.layer === h.layer).sort((a, b) => {
    const ia = h.interventionIds.indexOf(a.id);
    const ib = h.interventionIds.indexOf(b.id);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  return (
    <Section
      id="planner"
      step="Act"
      title="Action Planner"
      intro="Choose the problem, compare the options, and turn one into a plan with a baseline, a target and a monitoring schedule."
    >
      <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
        <label htmlFor="problem-select" className="text-sm font-semibold">Problem</label>
        <select
          id="problem-select"
          value={h.id}
          onChange={(e) => selectHotspot(e.target.value)}
          className="w-full max-w-xl rounded border border-line bg-white px-3 py-2 text-sm"
        >
          {RANKED_HOTSPOTS.map((r) => (
            <option key={r.hotspot.id} value={r.hotspot.id}>
              {r.hotspot.name} ({INDICATOR_BY_ID[r.hotspot.layer].label}, priority {r.priority})
            </option>
          ))}
        </select>
      </div>
      <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-ink-soft">
        <StatusBadge status={SEVERITY_STATUS[sev]}>{SEVERITY_LABEL[sev]} severity</StatusBadge>
        <span>{h.signal}</span>
        {!hotspotId && <span className="text-ink-mute">Showing the highest-priority problem. Pick a hotspot on the map to change it.</span>}
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-12">
        <fieldset className="lg:col-span-7">
          <legend className="mb-3 flex items-center gap-2 text-sm font-semibold">Possible interventions <DemoTag /></legend>
          <div className="space-y-3">
            {items.map((i) => {
              const recommended = h.interventionIds.includes(i.id);
              return (
                <label
                  key={i.id}
                  className="block cursor-pointer rounded-md border border-line bg-white p-4 transition-colors has-[:checked]:border-signal has-[:checked]:ring-1 has-[:checked]:ring-signal has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-signal"
                >
                  <input
                    type="radio"
                    name="intervention"
                    className="sr-only"
                    checked={interventionId === i.id}
                    onChange={() => selectIntervention(i.id)}
                  />
                  <span className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-display text-lg font-semibold">{i.name}</span>
                    {recommended && <span className="rounded bg-signal/10 px-2 py-0.5 text-xs font-semibold text-signal">Suggested for this hotspot</span>}
                  </span>
                  <span className="mt-1 block text-sm text-ink-soft">{i.summary}</span>
                  <span className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                    <span className="flex items-center justify-between gap-3"><span className="text-ink-mute">Implementation effort</span><Meter value={i.effort} label="Effort" /></span>
                    <span className="flex items-center justify-between gap-3"><span className="text-ink-mute">Environmental benefit</span><Meter value={i.benefit} label="Benefit" /></span>
                    <span className="flex justify-between gap-3"><span className="text-ink-mute">Time to impact</span><span className="text-right">{i.timeToImpact}</span></span>
                    <span className="flex justify-between gap-3"><span className="text-ink-mute">Affected area</span><span className="text-right">{i.area}</span></span>
                  </span>
                  <span className="mt-3 flex flex-wrap gap-1.5">
                    {i.sdg.map((s) => <span key={s} className="rounded bg-mist px-2 py-0.5 text-xs text-ink-soft">{s}</span>)}
                  </span>
                  <span className="mt-3 block text-xs text-ink-mute">Monitor: {i.monitoring.join(', ')}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="space-y-6 lg:sticky lg:top-20 lg:col-span-5 lg:self-start">
          <Panel className="p-5">
            <h3 className="font-display text-lg font-semibold">Which options give the most benefit for the effort?</h3>
            <p className="mb-2 mt-1 text-sm text-ink-soft">Ratings out of 5 for the options above.</p>
            <InterventionChart items={items} />
            <DemoTag>Demonstration estimates, not validated predictions</DemoTag>
          </Panel>
          <Panel className="p-5">
            <h3 className="font-display text-lg font-semibold">{sel ? sel.name : 'No intervention selected'}</h3>
            <p className="mt-1 text-sm text-ink-soft">
              {sel ? `Selected for ${h.name}.` : 'Select an intervention on the left to model it or plan it.'}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={!sel?.lever}
                onClick={() => { loadIntervention(sel); setTimeout(() => scrollToId('simulator'), 80); }}
                className="rounded border border-line px-4 py-2 text-sm font-semibold hover:bg-mist disabled:cursor-not-allowed disabled:opacity-50"
              >
                Model in simulator
              </button>
              <button
                type="button"
                disabled={!sel}
                onClick={() => setPlanModalOpen(true)}
                className="rounded bg-signal px-4 py-2 text-sm font-semibold text-white hover:bg-[#085E5A] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Create action plan
              </button>
            </div>
            {sel && !sel.lever && <p className="mt-3 text-xs text-ink-mute">This intervention has no matching lever in the demo scenario model, so it cannot be simulated. It can still be planned.</p>}
          </Panel>
        </div>
      </div>
    </Section>
  );
}
