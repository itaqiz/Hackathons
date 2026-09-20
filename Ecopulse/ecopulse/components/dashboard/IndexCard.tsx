'use client';

import type { Period } from '@/lib/types';
import { CURRENT, CURRENT_INDEX, INDEX_SERIES, INDICATORS } from '@/data/indicators';
import { PERIOD_LABEL, changeOver, round1 } from '@/lib/series';
import { statusOf, STATUS } from '@/lib/scoring';
import { Change, Panel, StatusBadge, Tip } from '@/components/ui/primitives';

export function IndexCard({ period }: { period: Period }) {
  const status = statusOf(CURRENT_INDEX);
  const ch = changeOver(INDEX_SERIES, period);
  return (
    <Panel className="h-full p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <h3 className="font-display text-xl font-semibold">Environmental Health Index</h3>
        <Tip label="the Environmental Health Index">
          A weighted mean of six indicator scores, each on a 0-100 scale where higher is healthier. Built for prioritization and visualization. It is not an official standard.
        </Tip>
      </div>
      <div className="mt-4 flex flex-wrap items-end gap-x-4 gap-y-2">
        <p className="font-display text-7xl font-semibold leading-none tabular-nums" style={{ color: STATUS[status].text }}>
          {Math.round(CURRENT_INDEX)}
        </p>
        <div className="pb-1">
          <p className="text-sm text-ink-mute">out of 100</p>
          <StatusBadge status={status} />
        </div>
      </div>
      <p className="mt-3"><Change points={ch.points} percent={ch.percent} suffix={`over ${PERIOD_LABEL[period]}`} /></p>
      <p className="mt-3 text-sm text-ink-soft">
        Demonstration data for the fictional Marlow Basin. The index is a weighted mean, so each row below shows exactly what it is made of.
      </p>

      <table className="mt-5 w-full text-sm">
        <caption className="sr-only">How each indicator contributes to the Environmental Health Index</caption>
        <thead>
          <tr className="border-b border-line text-left text-ink-mute">
            <th scope="col" className="py-2 font-medium">Indicator</th>
            <th scope="col" className="py-2 text-right font-medium">Weight</th>
            <th scope="col" className="py-2 pl-3 font-medium">Score</th>
            <th scope="col" className="py-2 text-right font-medium">Adds</th>
          </tr>
        </thead>
        <tbody>
          {INDICATORS.map((i) => {
            const s = STATUS[statusOf(CURRENT[i.id])];
            return (
              <tr key={i.id} className="border-b border-line/70">
                <th scope="row" className="py-2 text-left font-normal">{i.label}</th>
                <td className="py-2 text-right tabular-nums text-ink-soft">{Math.round(i.weight * 100)}%</td>
                <td className="py-2 pl-3">
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-16 rounded-full bg-line" aria-hidden>
                      <span className="block h-full rounded-full" style={{ width: `${CURRENT[i.id]}%`, backgroundColor: s.fill }} />
                    </span>
                    <span className="tabular-nums">{Math.round(CURRENT[i.id])}</span>
                  </span>
                </td>
                <td className="py-2 text-right tabular-nums">{round1(CURRENT[i.id] * i.weight).toFixed(1)}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row" className="pt-2 text-left font-semibold">Index</th>
            <td className="pt-2 text-right tabular-nums">100%</td>
            <td />
            <td className="pt-2 text-right font-semibold tabular-nums">{CURRENT_INDEX.toFixed(1)}</td>
          </tr>
        </tfoot>
      </table>
    </Panel>
  );
}
