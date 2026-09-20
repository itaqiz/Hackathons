'use client';

import { CURRENT, CURRENT_INDEX, INDICATORS } from '@/data/indicators';
import { DATASET_VERSION } from '@/lib/config';
import { PRIORITY_WEIGHTS } from '@/lib/scoring';
import { round1 } from '@/lib/series';
import { Panel, Section } from '@/components/ui/primitives';

const DATA_CLASSES = [
  ['Demonstration data', 'Used', 'All district scores, hotspot records, populations, intervention ratings and community action numbers. Authored for this demo.'],
  ['Derived indicators', 'Used', 'City-level scores (population-weighted district means), the Environmental Health Index, priority scores and scenario results.'],
  ['User-entered data', 'Used', 'Action plans, progress logs and joins. Stored in the browser only, never sent to a server.'],
  ['External or open data', 'Optional, live only', 'Open-Meteo current air quality and feels-like temperature, fetched in your browser. It can colour the Air quality and Heat map layers for a real region. The demo index and all other layers stay simulated.'],
];

const PIPELINE: { step: string; state: string; how: string }[] = [
  { step: 'Environmental observations', state: 'Simulated', how: 'A static demo dataset stands in for observations. There is no ingestion.' },
  { step: 'Data normalization', state: 'Authored', how: 'Demo values are written directly on a 0-100 scale, higher is healthier. A normalization step for real units is a future extension.' },
  { step: 'Indicator calculation', state: 'Implemented', how: 'Population-weighted mean of district scores gives each city-level indicator. The index is a weighted mean of the six.' },
  { step: 'Risk and priority assessment', state: 'Implemented', how: 'Each hotspot gets a priority score from severity, population exposed and trend.' },
  { step: 'Intervention recommendation', state: 'Implemented', how: 'A rule-based lookup: each problem type maps to a curated list of interventions. No learned model.' },
  { step: 'Scenario simulation', state: 'Implemented', how: 'Additive linear coefficients per lever, capped at 100. Direction and relative size only.' },
  { step: 'Budgeted portfolio selection', state: 'Implemented', how: 'Exact multiple-choice knapsack (dynamic programming) picks the best mix of interventions for an effort budget.' },
  { step: 'Impact monitoring', state: 'Implemented', how: 'A plan stores baseline, target, cadence and indicators. Progress is logged manually on the board.' },
];

const REAL_DATA = [
  ['Air quality', 'Open-Meteo modelled air quality (used in the live lookup), OpenAQ stations (candidate)'],
  ['Heat', 'Open-Meteo apparent temperature (used in the live lookup), Landsat thermal bands (candidate)'],
  ['Green coverage', 'Sentinel-2 vegetation indices, ESA WorldCover land cover'],
  ['Water stress', 'WRI Aqueduct water risk data, local utility records'],
  ['Biodiversity', 'GBIF and iNaturalist observations, community surveys'],
  ['Waste', 'Municipal collection records, community reports'],
  ['Base map', 'OpenStreetMap'],
];

export function Evidence() {
  const terms = INDICATORS.map((i) => `${i.weight.toFixed(2)} x ${round1(CURRENT[i.id])}`).join(' + ');
  return (
    <Section
      id="evidence"
      title="Evidence and method"
      intro="What the data is, how each number is produced, and what EcoPulse does not do."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel className="p-5 sm:p-6">
          <h3 className="font-display text-xl font-semibold">Data</h3>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <caption className="sr-only">Data classes and whether the demo uses them</caption>
              <thead><tr className="border-b border-line text-ink-mute"><th scope="col" className="py-2 font-medium">Class</th><th scope="col" className="py-2 font-medium">In this demo</th><th scope="col" className="py-2 font-medium">Detail</th></tr></thead>
              <tbody>
                {DATA_CLASSES.map(([a, b, c]) => (
                  <tr key={a} className="border-b border-line/70 align-top">
                    <th scope="row" className="py-2.5 pr-3 text-left font-semibold">{a}</th>
                    <td className="py-2.5 pr-3">{b}</td>
                    <td className="py-2.5 text-ink-soft">{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-ink-soft">Dataset version {DATASET_VERSION}. EcoPulse does not use machine learning, satellite imagery or IoT sensors. The only network call is the optional Open-Meteo lookup.</p>
        </Panel>

        <Panel className="p-5 sm:p-6">
          <h3 className="font-display text-xl font-semibold">Method</h3>
          <ol className="mt-4 space-y-3">
            {PIPELINE.map((p, i) => (
              <li key={p.step} className="grid grid-cols-[1.5rem_1fr] gap-3 text-sm">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-deep text-xs font-semibold text-white">{i + 1}</span>
                <span>
                  <span className="font-semibold">{p.step}</span>{' '}
                  <span className={`ml-1 rounded px-1.5 py-0.5 text-xs font-medium ${p.state === 'Implemented' ? 'bg-signal/10 text-signal' : 'bg-mist text-ink-soft'}`}>{p.state}</span>
                  <span className="mt-0.5 block text-ink-soft">{p.how}</span>
                </span>
              </li>
            ))}
          </ol>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel className="p-5 sm:p-6">
          <h3 className="font-display text-xl font-semibold">Scoring logic</h3>
          <p className="mt-3 text-sm text-ink-soft">Environmental Health Index, using current demo values:</p>
          <p className="mt-2 break-words rounded bg-mist p-3 text-sm tabular-nums">{terms} = <span className="font-semibold">{CURRENT_INDEX.toFixed(1)}</span></p>
          <p className="mt-4 text-sm text-ink-soft">Status bands: Good 75 and above, Moderate 60 to 74, Poor 45 to 59, Critical below 45.</p>
          <p className="mt-3 text-sm text-ink-soft">
            Hotspot priority = {PRIORITY_WEIGHTS.severity} x severity + {PRIORITY_WEIGHTS.population} x population exposed + {PRIORITY_WEIGHTS.trend} x trend, each on 0 to 100. The index is a prioritization and visualization aid, not an official standard. The weights are demonstration choices and a real deployment would set them with local stakeholders.
          </p>
        </Panel>
        <Panel className="p-5 sm:p-6">
          <h3 className="font-display text-xl font-semibold">Path to real data</h3>
          <p className="mt-2 text-sm text-ink-soft">Open-Meteo is the only source connected, and only for the live lookup. The rest are candidates for replacing the demo dataset.</p>
          <dl className="mt-3 divide-y divide-line/70 text-sm">
            {REAL_DATA.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-2"><dt className="font-semibold">{k}</dt><dd className="text-right text-ink-soft">{v}</dd></div>
            ))}
          </dl>
        </Panel>
      </div>
    </Section>
  );
}
