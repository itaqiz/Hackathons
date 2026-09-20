'use client';

import { useEffect, useState } from 'react';
import { Menu, Play, X } from 'lucide-react';
import { useStore } from '@/components/Providers';

const NAV = [
  ['overview', 'Overview'], ['pulse', 'Pulse'], ['map', 'Map'], ['pressure', 'Pressure'],
  ['planner', 'Planner'], ['optimizer', 'Optimizer'], ['simulator', 'Simulator'], ['community', 'Community'], ['evidence', 'Method'],
] as const;

export function Header() {
  const { setTransparencyOpen, startJudge } = useStore();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState('overview');

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setCurrent(e.target.id)),
      { rootMargin: '-30% 0px -60% 0px' },
    );
    NAV.forEach(([id]) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);

  return (
    <header className="on-dark sticky top-0 z-40 border-b border-deep-line bg-deep text-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <a href="#overview" className="flex items-center gap-2 font-display text-lg font-semibold">
          <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden><rect width="32" height="32" rx="6" fill="#0E262D" /><path d="M4 17h6l3-8 5 15 3-7h7" fill="none" stroke="#6FD3CB" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          EcoPulse
        </a>
        <nav aria-label="Main" className="ml-4 hidden items-center gap-1 xl:flex">
          {NAV.map(([id, label]) => (
            <a key={id} href={`#${id}`} aria-current={current === id ? 'true' : undefined} className={`whitespace-nowrap rounded px-2.5 py-1.5 text-sm ${current === id ? 'bg-deep-2 text-white' : 'text-[#B6CBD0] hover:text-white'}`}>{label}</a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <button type="button" onClick={() => setTransparencyOpen(true)} className="hidden whitespace-nowrap rounded border border-[#B98A1B] px-2.5 py-1 text-xs font-semibold text-[#F2C453] sm:block">Demo environment</button>
          <button type="button" onClick={startJudge} className="flex items-center gap-1.5 whitespace-nowrap rounded bg-signal-light px-3 py-1.5 text-sm font-semibold text-deep hover:bg-white">
            <Play size={14} aria-hidden /> Judge mode
          </button>
          <button type="button" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen((o) => !o)} className="rounded p-2 xl:hidden">
            {open ? <X size={20} aria-hidden /> : <Menu size={20} aria-hidden />}
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-deep-line bg-deep px-4 py-3 xl:hidden">
          <ul className="grid grid-cols-2 gap-1">
            {NAV.map(([id, label]) => (
              <li key={id}><a href={`#${id}`} onClick={() => setOpen(false)} className="block rounded px-3 py-2 text-sm text-[#D6E4E7] hover:bg-deep-2">{label}</a></li>
            ))}
            <li className="col-span-2"><button type="button" onClick={() => { setOpen(false); setTransparencyOpen(true); }} className="w-full rounded border border-[#B98A1B] px-3 py-2 text-left text-sm font-semibold text-[#F2C453]">Demo environment: simulated data</button></li>
          </ul>
        </nav>
      )}
    </header>
  );
}
