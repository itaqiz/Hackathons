'use client';

import { useStore } from '@/components/Providers';
import { DISTRICTS } from '@/data/districts';
import { INDICATOR_BY_ID } from '@/data/indicators';
import { HOTSPOT_BY_ID } from '@/data/hotspots';
import { INTERVENTION_BY_ID } from '@/data/interventions';
import { STATUS } from '@/lib/scoring';
import { fmt } from '@/lib/format';
import { scrollToId } from '@/lib/scroll';
import type { CommunityAction, Plan } from '@/lib/types';
import { Panel, Section } from '@/components/ui/primitives';

type ColStatus = 'Planning' | 'Active' | 'Completed';
const COLS: { key: ColStatus; hint: string }[] = [
  { key: 'Planning', hint: 'Not started' },
  { key: 'Active', hint: 'In progress' },
  { key: 'Completed', hint: 'Target met' },
];
const derive = (a: CommunityAction): ColStatus => (a.current >= a.target ? 'Completed' : a.current > 0 || a.status === 'Active' ? 'Active' : 'Planning');
const pct = (a: CommunityAction) => Math.round((a.current / a.target) * 100);

function Ring({ value }: { value: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 84 84" className="h-24 w-24" role="img" aria-label={`Overall progress ${value} percent`}>
      <circle cx="42" cy="42" r={r} fill="none" stroke="#D1DBDC" strokeWidth="8" />
      <circle cx="42" cy="42" r={r} fill="none" stroke="#0A716C" strokeWidth="8" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} transform="rotate(-90 42 42)" />
      <text x="42" y="47" textAnchor="middle" fontSize="18" fontWeight="600" fill="#0B1B20">{value}%</text>
    </svg>
  );
}

function ActionCard({ a }: { a: CommunityAction }) {
  const { joined, toggleJoin, logProgress } = useStore();
  const p = pct(a);
  const isIn = joined.includes(a.id);
  const done = a.current >= a.target;
  const district = DISTRICTS.find((d) => d.id === a.districtId)?.name;
  return (
    <li className="rounded-md border border-line bg-white p-4">
      <p className="text-xs text-ink-mute">{district}{a.fromPlan ? ', from action plan' : ''}</p>
      <h4 className="mt-0.5 font-semibold leading-snug">{a.title}</h4>
      <p className="mt-1 text-xs text-ink-soft">Moves: {INDICATOR_BY_ID[a.layer].label}</p>
      <div className="mt-3">
        <div className="flex items-baseline justify-between text-sm">
          <span className="tabular-nums"><span className="font-semibold">{fmt(a.current)}</span> of {fmt(a.target)} {a.unit}</span>
          <span className="font-semibold tabular-nums">{p}%</span>
        </div>
        <div className="mt-1.5 h-2 rounded-full bg-line" role="progressbar" aria-valuenow={p} aria-valuemin={0} aria-valuemax={100} aria-label={`${a.title} progress`}>
          <div className="h-full rounded-full transition-all" style={{ width: `${p}%`, backgroundColor: done ? STATUS.good.fill : '#0A716C' }} />
        </div>
      </div>
      <p className="mt-3 text-xs text-ink-soft">{a.note}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs text-ink-mute tabular-nums">{fmt(a.participants)} participants</span>
        <span className="flex-1" />
        <button type="button" aria-pressed={isIn} onClick={() => toggleJoin(a.id)} className="rounded border border-line px-2.5 py-1 text-xs font-semibold hover:bg-mist aria-pressed:bg-mist">
          {isIn ? 'Joined' : 'Join'}
        </button>
        <button type="button" disabled={done} onClick={() => logProgress(a.id)} className="rounded bg-deep px-2.5 py-1 text-xs font-semibold text-white hover:bg-deep-2 disabled:opacity-40">
          Log +{fmt(a.step)}
        </button>
      </div>
    </li>
  );
}

function downloadBrief(plans: Plan[]) {
  const lines = ['# EcoPulse action plan brief', '', 'Demonstration data for the fictional Marlow Basin. Baselines, targets and effects are simulated.', ''];
  plans.forEach((p, n) => {
    const h = HOTSPOT_BY_ID[p.hotspotId];
    const iv = INTERVENTION_BY_ID[p.interventionId];
    lines.push(`## ${n + 1}. ${p.title}`, '', `- Problem: ${h.name} (${INDICATOR_BY_ID[h.layer].label})`, `- Intervention: ${iv.name}`, `- Baseline score: ${p.baseline}, target score: ${p.target}`, `- Timeframe: ${p.timeframe}, monitoring check: ${p.cadence}`, `- Lead group: ${p.owner || 'Information not provided'}`, `- Monitored: ${iv.monitoring.join(', ')}`, '');
  });
  const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/markdown' }));
  const a = document.createElement('a');
  a.href = url; a.download = 'ecopulse-plan-brief.md'; a.click();
  URL.revokeObjectURL(url);
}

export function CommunityBoard() {
  const { actions, plans, resetDemo } = useStore();
  const overall = Math.round((actions.reduce((s, a) => s + Math.min(1, a.current / a.target), 0) / actions.length) * 100);
  const participants = actions.reduce((s, a) => s + a.participants, 0);
  const grouped = COLS.map((c) => ({ ...c, items: actions.filter((a) => derive(a) === c.key) }));

  return (
    <Section
      id="community"
      step={['Act', 'Measure']}
      title="Community action board"
      intro="Actions people are running now, with a target and a measured amount of progress. Plans created in the Action Planner join the board and can be tracked here."
    >
      <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <Panel className="flex flex-col items-start gap-4 p-5 lg:sticky lg:top-20 lg:self-start">
          <div className="flex items-center gap-4">
            <Ring value={overall} />
            <div>
              <p className="text-sm font-semibold">Overall progress</p>
              <p className="text-xs text-ink-mute">Average across {actions.length} actions</p>
            </div>
          </div>
          <dl className="grid w-full grid-cols-2 gap-3 text-sm">
            <div><dt className="text-ink-mute">Participants</dt><dd className="text-xl font-semibold tabular-nums">{fmt(participants)}</dd></div>
            <div><dt className="text-ink-mute">Plans created</dt><dd className="text-xl font-semibold tabular-nums">{plans.length}</dd></div>
          </dl>
          <p className="text-xs text-ink-mute">Participant counts and progress are simulated. Your plans and progress logs are saved only in this browser.</p>
          <button type="button" onClick={resetDemo} className="rounded border border-line px-3 py-1.5 text-sm font-semibold hover:bg-mist">Reset demo state</button>
        </Panel>

        <div className="grid gap-5 md:grid-cols-3">
          {grouped.map((col) => (
            <section key={col.key} aria-label={`${col.key} actions`}>
              <h3 className="mb-3 flex items-baseline justify-between text-sm font-semibold">
                <span>{col.key} <span className="font-normal text-ink-mute">{col.hint}</span></span>
                <span className="rounded bg-white px-2 py-0.5 tabular-nums">{col.items.length}</span>
              </h3>
              <ul className="space-y-3">
                {col.items.map((a) => <ActionCard key={a.id} a={a} />)}
              </ul>
              {col.items.length === 0 && <p className="rounded-md border border-dashed border-line p-4 text-sm text-ink-mute">Nothing here yet.</p>}
            </section>
          ))}
        </div>
      </div>

      <div id="monitoring" className="mt-12 scroll-mt-20">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-2xl font-semibold">Monitoring plans</h3>
          {plans.length > 0 && <button type="button" onClick={() => downloadBrief(plans)} className="rounded border border-line bg-white px-3 py-1.5 text-sm font-semibold hover:bg-mist">Download plan brief (.md)</button>}
        </div>
        <p className="mt-1 max-w-2xl text-sm text-ink-soft">Each plan records where it started, where it should get to, and what will be checked to find out whether it worked.</p>
        {plans.length === 0 ? (
          <Panel className="mt-4 p-6 text-sm text-ink-soft">
            No plans yet. Select an intervention in the Action Planner and create one.
            <button type="button" onClick={() => scrollToId('planner')} className="ml-2 font-semibold text-signal underline underline-offset-2">Open Action Planner</button>
          </Panel>
        ) : (
          <ul className="mt-4 grid gap-4 md:grid-cols-2">
            {plans.map((p) => {
              const a = actions.find((x) => x.id === p.id);
              const h = HOTSPOT_BY_ID[p.hotspotId];
              const iv = INTERVENTION_BY_ID[p.interventionId];
              const gained = a?.current ?? 0;
              return (
                <li key={p.id} className="rounded-md border border-line bg-white p-5">
                  <h4 className="font-display text-lg font-semibold leading-snug">{p.title}</h4>
                  <p className="mt-1 text-sm text-ink-soft">{INDICATOR_BY_ID[h.layer].label}. {p.timeframe}. {p.cadence} check{p.owner ? `. Lead: ${p.owner}` : ''}.</p>
                  <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
                    <div className="rounded bg-mist p-2"><p className="text-xs text-ink-mute">Baseline</p><p className="text-xl font-semibold tabular-nums">{p.baseline}</p></div>
                    <div className="rounded bg-mist p-2"><p className="text-xs text-ink-mute">Logged now</p><p className="text-xl font-semibold tabular-nums">{p.baseline + gained}</p></div>
                    <div className="rounded bg-mist p-2"><p className="text-xs text-ink-mute">Target</p><p className="text-xl font-semibold tabular-nums">{p.target}</p></div>
                  </div>
                  <p className="mt-4 text-sm font-semibold">Checked at each monitoring point</p>
                  <ul className="mt-1 list-disc pl-5 text-sm text-ink-soft">{iv.monitoring.map((m) => <li key={m}>{m}</li>)}</ul>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Section>
  );
}
