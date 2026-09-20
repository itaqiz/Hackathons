'use client';

import { useId, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, Info, Minus } from 'lucide-react';
import { STATUS } from '@/lib/scoring';
import { signed } from '@/lib/format';
import type { StatusKey } from '@/lib/types';

export function StatusBadge({ status, children }: { status: StatusKey; children?: ReactNode }) {
  const s = STATUS[status];
  return (
    <span className="inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-semibold" style={{ color: s.text, backgroundColor: `${s.fill}26` }}>
      <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.fill }} />
      {children ?? s.label}
    </span>
  );
}

export function DemoTag({ children = 'Demonstration estimates' }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded border border-dashed border-ink-mute/60 px-1.5 py-0.5 text-[11px] font-medium text-ink-mute">
      {children}
    </span>
  );
}

/** Change in score points. Up is good on the 0-100 health scale. */
export function Change({ points, percent, suffix }: { points: number; percent?: number; suffix?: string }) {
  const up = points > 0.05;
  const down = points < -0.05;
  const Icon = up ? ArrowUp : down ? ArrowDown : Minus;
  const color = up ? STATUS.good.text : down ? STATUS.critical.text : '#586B72';
  return (
    <span className="inline-flex items-center gap-1 text-sm font-medium tabular-nums" style={{ color }}>
      <Icon size={14} aria-hidden />
      <span>
        {signed(points)} pts{percent !== undefined ? ` (${signed(percent)}%)` : ''}
        {suffix ? <span className="font-normal text-ink-mute"> {suffix}</span> : null}
      </span>
      <span className="sr-only">{up ? 'improving' : down ? 'worsening' : 'unchanged'}</span>
    </span>
  );
}

export function Segmented<T extends string>({
  label, value, onChange, options, className = '',
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  className?: string;
}) {
  return (
    <div role="group" aria-label={label} className={`inline-flex flex-wrap gap-1 rounded-md border border-line bg-white p-1 ${className}`}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
            value === o.value ? 'bg-deep text-white' : 'text-ink-soft hover:bg-mist'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Tip({ label, children }: { label: string; children: ReactNode }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label={`About ${label}`}
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
        className="rounded-full p-0.5 text-ink-mute hover:text-ink"
      >
        <Info size={15} aria-hidden />
      </button>
      {open && (
        <span
          role="tooltip"
          id={id}
          className="absolute left-1/2 top-full z-30 mt-2 w-64 -translate-x-1/2 rounded-md bg-deep p-3 text-left text-xs font-normal leading-relaxed text-white"
        >
          {children}
        </span>
      )}
    </span>
  );
}

export function Meter({ value, max = 5, label }: { value: number; max?: number; label: string }) {
  return (
    <span className="inline-flex gap-1" role="img" aria-label={`${label}: ${value} of ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={`h-2 w-4 rounded-sm ${i < value ? 'bg-signal' : 'bg-line'}`} />
      ))}
    </span>
  );
}

export const LOOP = ['Sense', 'Understand', 'Prioritize', 'Act', 'Measure'] as const;
export type LoopStep = (typeof LOOP)[number];

/** Five-segment marker showing which stage of the loop a section belongs to. */
export function LoopMark({ step, dark }: { step: LoopStep | LoopStep[]; dark?: boolean }) {
  const active = Array.isArray(step) ? step : [step];
  return (
    <p className={`flex items-center gap-2 text-sm font-semibold ${dark ? 'text-signal-light' : 'text-signal'}`}>
      <span className="flex items-center gap-1" aria-hidden>
        {LOOP.map((l) => (
          <span key={l} className={`h-1.5 rounded-full ${active.includes(l) ? 'w-5 bg-current' : `w-1.5 ${dark ? 'bg-deep-line' : 'bg-line'}`}`} />
        ))}
      </span>
      <span>{active.join(' and ')}</span>
    </p>
  );
}

export function Section({
  id, step, title, intro, children,
}: {
  id: string;
  step?: LoopStep | LoopStep[];
  title: string;
  intro?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-16 border-t border-line">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <header className="mb-10 max-w-3xl">
          {step && <LoopMark step={step} />}
          <h2 id={`${id}-h`} className="mt-3 font-display text-3xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">{title}</h2>
          {intro && <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">{intro}</p>}
        </header>
        {children}
      </div>
    </section>
  );
}

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`min-w-0 rounded-md border border-line bg-white ${className}`}>{children}</div>;
}
