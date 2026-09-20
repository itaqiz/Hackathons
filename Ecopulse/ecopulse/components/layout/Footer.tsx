'use client';

import { useStore } from '@/components/Providers';
import { REPO_URL } from '@/lib/config';
import { scrollToId } from '@/lib/scroll';

export function Footer() {
  const { setTransparencyOpen } = useStore();
  const link = 'text-[#B6CBD0] hover:text-white underline-offset-2 hover:underline';
  return (
    <footer className="on-dark bg-deep text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-start justify-between gap-8 px-4 py-12 sm:px-6">
        <div>
          <p className="font-display text-xl font-semibold">EcoPulse</p>
          <p className="mt-1 text-[#B6CBD0]">Environmental intelligence for community action.</p>
          <p className="mt-4 max-w-md text-sm text-[#8FA9AF]">Demo environment. All data is simulated for a fictional district and is not a measurement of any real place.</p>
        </div>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <li><button type="button" className={link} onClick={() => scrollToId('evidence')}>Data and methodology</button></li>
          <li><button type="button" className={link} onClick={() => setTransparencyOpen(true)}>Transparency</button></li>
          {REPO_URL && <li><a className={link} href={REPO_URL} target="_blank" rel="noreferrer">GitHub</a></li>}
          <li><button type="button" className={link} onClick={() => scrollToId('about')}>About</button></li>
        </ul>
      </div>
    </footer>
  );
}
