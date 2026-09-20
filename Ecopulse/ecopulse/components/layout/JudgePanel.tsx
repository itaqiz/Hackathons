'use client';

import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useStore } from '@/components/Providers';
import { JUDGE_STEPS } from '@/lib/judge';

export function JudgePanel() {
  const { judge, goStep, closeJudge, toast } = useStore();
  const s = JUDGE_STEPS[judge.step];
  const last = judge.step === JUDGE_STEPS.length - 1;
  return (
    <>
      {judge.open && (
        <aside aria-label="Judge mode walkthrough" className="on-dark fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl rounded-md border border-deep-line bg-deep p-4 text-white shadow-lg">
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-semibold text-signal-light">Step {judge.step + 1} of {JUDGE_STEPS.length}</p>
            <button type="button" onClick={closeJudge} aria-label="Close judge mode" className="-m-1 rounded p-1 text-[#B6CBD0] hover:text-white"><X size={16} aria-hidden /></button>
          </div>
          <h2 className="mt-1 font-display text-lg font-semibold">{s.title}</h2>
          <p className="mt-1 text-sm text-[#B6CBD0]">{s.say}</p>
          <div className="mt-3 flex items-center gap-2">
            <button type="button" disabled={judge.step === 0} onClick={() => goStep(judge.step - 1)} className="flex items-center gap-1 rounded border border-[#3B5E67] px-3 py-1.5 text-sm font-semibold hover:bg-deep-2 disabled:opacity-40"><ChevronLeft size={15} aria-hidden />Back</button>
            <button type="button" onClick={() => (last ? closeJudge() : goStep(judge.step + 1))} className="ml-auto flex items-center gap-1 rounded bg-signal-light px-3 py-1.5 text-sm font-semibold text-deep hover:bg-white">{last ? 'Finish' : 'Next'}{!last && <ChevronRight size={15} aria-hidden />}</button>
          </div>
        </aside>
      )}
      <div role="status" aria-live="polite" className="pointer-events-none fixed left-1/2 top-16 z-[60] -translate-x-1/2">
        {toast && <p className="rounded bg-deep px-4 py-2 text-sm font-medium text-white shadow-lg">{toast}</p>}
      </div>
    </>
  );
}
