'use client';

import { DATASET_VERSION } from '@/lib/config';
import { scrollToId } from '@/lib/scroll';
import { useStore } from '@/components/Providers';

const ROWS: { label: string; body: string }[] = [
  { label: 'Real data', body: 'Only the optional live lookup in the Pulse section. Your browser asks Open-Meteo for modelled grid values at a place, or at six points across about 50 km when you map a region. Live values colour the Air quality and Heat map layers and never change the demo index.' },
  { label: 'Simulated data', body: 'Every district score, hotspot, population figure, trend, intervention rating and community progress number.' },
  { label: 'Last updated', body: `Dataset version ${DATASET_VERSION}. A static snapshot bundled with the app. It does not refresh while the app runs.` },
  { label: 'How indicators are calculated', body: 'City scores are population-weighted means of district scores. The Environmental Health Index is a weighted mean of six indicators.' },
];

const LIMITS = [
  'Scores are authored for demonstration, so they say nothing about any real place.',
  'Intervention effort, benefit and timing are demonstration estimates, not validated predictions.',
  'The simulator uses linear coefficients chosen for illustration. It shows direction, not forecasts.',
  'The index is a prioritization and visualization aid. It is not an official environmental standard.',
];

export function TransparencyPanel({ full, onNavigate }: { full?: boolean; onNavigate?: () => void }) {
  const { setTransparencyOpen } = useStore();
  return (
    <div className="text-sm">
      <dl className="space-y-3">
        {ROWS.map((r) => (
          <div key={r.label}>
            <dt className="font-semibold">{r.label}</dt>
            <dd className="mt-0.5 text-ink-soft">{r.body}</dd>
          </div>
        ))}
      </dl>
      {full && (
        <div className="mt-4">
          <h3 className="font-semibold">Limitations</h3>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-ink-soft">
            {LIMITS.map((l) => <li key={l}>{l}</li>)}
          </ul>
        </div>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => { onNavigate?.(); setTimeout(() => scrollToId('evidence'), 120); }}
          className="rounded border border-line px-3 py-1.5 font-medium hover:bg-mist"
        >
          See the method
        </button>
        {!full && (
          <button type="button" onClick={() => setTransparencyOpen(true)} className="rounded border border-line px-3 py-1.5 font-medium hover:bg-mist">
            Read the limitations
          </button>
        )}
      </div>
    </div>
  );
}
