'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Replaces Bootstrap's `data-bs-toggle="dropdown"` (Bootstrap JS is not loaded
 * in this project). Closes on outside click, Escape, and — unless
 * `autoClose: 'outside'` — on a click inside the menu.
 */
export function useDropdown<T extends HTMLElement = HTMLDivElement>(
  options: { autoClose?: true | 'outside' } = {},
) {
  const { autoClose = true } = options;
  const [open, setOpen] = useState(false);
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const toggle = useCallback(() => setOpen((v) => !v), []);
  const close = useCallback(() => setOpen(false), []);

  /** Put on the `.dropdown-menu` element to close after picking an item. */
  const onMenuClick = useCallback(
    (e: React.MouseEvent) => {
      if (autoClose === 'outside') return;
      if ((e.target as HTMLElement).closest('a, button')) setOpen(false);
    },
    [autoClose],
  );

  return { open, setOpen, toggle, close, ref, onMenuClick };
}
