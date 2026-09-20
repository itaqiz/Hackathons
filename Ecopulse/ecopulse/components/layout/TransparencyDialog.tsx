'use client';

import { useStore } from '@/components/Providers';
import { Dialog } from '@/components/ui/Dialog';
import { TransparencyPanel } from '@/components/dashboard/TransparencyPanel';

export function TransparencyDialog() {
  const { transparencyOpen, setTransparencyOpen } = useStore();
  return (
    <Dialog open={transparencyOpen} onClose={() => setTransparencyOpen(false)} title="Data transparency">
      <TransparencyPanel full onNavigate={() => setTransparencyOpen(false)} />
    </Dialog>
  );
}
