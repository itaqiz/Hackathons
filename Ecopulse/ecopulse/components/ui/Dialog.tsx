'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

/** Thin wrapper on the native <dialog> element: focus trap, Escape to close and inert background come built in. */
export function Dialog({
  open, onClose, title, children, wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-auto max-h-[90vh] overflow-y-auto rounded-md border border-line bg-white p-0 text-ink backdrop:bg-deep/60"
      style={{ width: `min(94vw, ${wide ? 860 : 640}px)` }}
    >
      {open && (
        <div className="p-5 sm:p-7">
          <div className="mb-5 flex items-start justify-between gap-4">
            <h2 id={titleId} className="font-display text-2xl font-semibold tracking-tight">{title}</h2>
            <button type="button" onClick={onClose} aria-label="Close dialog" className="rounded p-1.5 text-ink-soft hover:bg-mist">
              <X size={20} aria-hidden />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}
