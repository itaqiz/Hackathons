'use client';

import { HOTSPOTS } from '@/data/hotspots';
import { CURRENT_INDEX } from '@/data/indicators';
import { TOTAL_POPULATION } from '@/data/indicators';
import { STATUS, severityOf, statusOf } from '@/lib/scoring';
import { fmt } from '@/lib/format';
import { scrollToId } from '@/lib/scroll';
import { LOOP } from '@/components/ui/primitives';
import { RegionSvg } from '@/components/map/RegionSvg';

const critical = HOTSPOTS.filter((h) => severityOf(h.localScore) === 'critical').length;

export function Hero() {
  const heat = HOTSPOTS.filter((h) => h.layer === 'heat');
  return (
    <section id="overview" className="on-dark scroll-mt-14 bg-deep text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_1fr] lg:items-center">
        <div>
          <p className="text-sm font-medium text-signal-light">Earth Forward hackathon entry. Demo environment.</p>
          <h1 className="mt-4 font-display text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl xl:text-7xl">
            Turn environmental signals into environmental action.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#B6CBD0]">
            EcoPulse helps communities turn fragmented environmental data into prioritized, measurable interventions: where to act first, what to do, and how to know if it worked.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" onClick={() => scrollToId('pulse')} className="rounded bg-signal-light px-5 py-3 font-semibold text-deep hover:bg-white">Explore Environmental Pulse</button>
            <button type="button" onClick={() => scrollToId('about')} className="rounded border border-[#3B5E67] px-5 py-3 font-semibold hover:bg-deep-2">See How It Works</button>
          </div>
          <dl className="mt-10 grid max-w-xl grid-cols-3 gap-4 border-t border-deep-line pt-6 text-sm">
            <div><dt className="text-[#8FA9AF]">Residents in demo district</dt><dd className="mt-1 text-2xl font-semibold tabular-nums">{fmt(TOTAL_POPULATION)}</dd></div>
            <div><dt className="text-[#8FA9AF]">Critical hotspots</dt><dd className="mt-1 text-2xl font-semibold tabular-nums" style={{ color: '#FF8A7E' }}>{critical}</dd></div>
            <div><dt className="text-[#8FA9AF]">Health index</dt><dd className="mt-1 text-2xl font-semibold tabular-nums">{Math.round(CURRENT_INDEX)}<span className="text-sm font-normal text-[#8FA9AF]"> / 100</span></dd></div>
          </dl>
        </div>
        <figure>
          <div className="overflow-hidden rounded-md border border-deep-line">
            <RegionSvg layer="heat" hotspots={heat} dark />
          </div>
          <figcaption className="mt-3 text-sm text-[#8FA9AF]">
            Heat risk across Marlow Basin, a fictional district. Pulsing markers are the highest-severity hotspots. All values are simulated.
          </figcaption>
        </figure>
      </div>
      <div className="border-t border-deep-line">
        <ol className="mx-auto grid max-w-7xl grid-cols-2 gap-x-4 gap-y-2 px-4 py-4 text-sm sm:grid-cols-5 sm:px-6" aria-label="The EcoPulse loop">
          {LOOP.map((l, i) => (
            <li key={l} className="flex items-center gap-2 text-[#B6CBD0]"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-deep-2 text-xs text-signal-light">{i + 1}</span>{l}</li>
          ))}
        </ol>
      </div>
    </section>
  );
}
