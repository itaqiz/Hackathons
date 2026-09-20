'use client';

import { useState, type FormEvent } from 'react';
import { useStore } from '@/components/Providers';
import { Dialog } from '@/components/ui/Dialog';
import { CADENCES, TIMEFRAMES, defaultPlan } from '@/lib/plan';
import { INTERVENTION_BY_ID } from '@/data/interventions';
import { INDICATOR_BY_ID } from '@/data/indicators';
import { scrollToId } from '@/lib/scroll';
import type { Hotspot, Intervention } from '@/lib/types';
import { DemoTag } from '@/components/ui/primitives';

function PlanForm({ hotspot, intervention, onDone }: { hotspot: Hotspot; intervention: Intervention; onDone: () => void }) {
  const { createPlan } = useStore();
  const init = defaultPlan(hotspot, intervention);
  const [title, setTitle] = useState(init.title);
  const [owner, setOwner] = useState('');
  const [timeframe, setTimeframe] = useState(init.timeframe);
  const [cadence, setCadence] = useState(init.cadence);
  const [target, setTarget] = useState(init.target);
  const valid = title.trim().length > 0 && Number.isFinite(target) && target > init.baseline && target <= 100;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    createPlan({ ...init, title: title.trim(), owner: owner.trim(), timeframe, cadence, target });
    onDone();
    setTimeout(() => scrollToId('community'), 200);
  };

  const field = 'mt-1 w-full rounded border border-line bg-white px-3 py-2 text-sm';
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="rounded bg-mist p-3 text-sm">
        <p><span className="font-semibold">Problem:</span> {hotspot.name} ({INDICATOR_BY_ID[hotspot.layer].label})</p>
        <p className="mt-1"><span className="font-semibold">Baseline:</span> local score {init.baseline} out of 100 <span className="text-ink-mute">(demo)</span></p>
      </div>
      <div>
        <label htmlFor="plan-title" className="text-sm font-semibold">Plan name</label>
        <input id="plan-title" required value={title} onChange={(e) => setTitle(e.target.value)} className={field} />
      </div>
      <div>
        <label htmlFor="plan-owner" className="text-sm font-semibold">Lead group <span className="font-normal text-ink-mute">(optional)</span></label>
        <input id="plan-owner" value={owner} onChange={(e) => setOwner(e.target.value)} className={field} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="plan-time" className="text-sm font-semibold">Timeframe</label>
          <select id="plan-time" value={timeframe} onChange={(e) => setTimeframe(e.target.value)} className={field}>
            {TIMEFRAMES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="plan-cadence" className="text-sm font-semibold">Monitoring check</label>
          <select id="plan-cadence" value={cadence} onChange={(e) => setCadence(e.target.value)} className={field}>
            {CADENCES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="plan-target" className="text-sm font-semibold">Target score</label>
          <input id="plan-target" type="number" min={init.baseline + 1} max={100} value={Number.isNaN(target) ? '' : target} onChange={(e) => setTarget(e.target.valueAsNumber)} className={field} aria-describedby="target-help" />
        </div>
      </div>
      <p id="target-help" className={`text-xs ${valid ? 'text-ink-mute' : 'text-[#9C1F16]'}`}>
        The target must be above the baseline ({init.baseline}) and no higher than 100. The default is a demonstration estimate.
      </p>
      <div>
        <h3 className="flex items-center gap-2 text-sm font-semibold">What will be monitored <DemoTag>From the intervention</DemoTag></h3>
        <ul className="mt-1 list-disc pl-5 text-sm text-ink-soft">
          {intervention.monitoring.map((m) => <li key={m}>{m}</li>)}
        </ul>
      </div>
      <div className="flex justify-end gap-2 border-t border-line pt-4">
        <button type="button" onClick={onDone} className="rounded border border-line px-4 py-2 text-sm font-semibold hover:bg-mist">Cancel</button>
        <button type="submit" disabled={!valid} className="rounded bg-signal px-4 py-2 text-sm font-semibold text-white hover:bg-[#085E5A] disabled:opacity-50">Create action plan</button>
      </div>
    </form>
  );
}

export function PlanModal() {
  const { planModalOpen, setPlanModalOpen, activeHotspot, selectedIntervention } = useStore();
  const intervention = selectedIntervention ?? INTERVENTION_BY_ID[activeHotspot.interventionIds[0]];
  return (
    <Dialog open={planModalOpen} onClose={() => setPlanModalOpen(false)} title="Create action plan">
      <PlanForm hotspot={activeHotspot} intervention={intervention} onDone={() => setPlanModalOpen(false)} />
    </Dialog>
  );
}
