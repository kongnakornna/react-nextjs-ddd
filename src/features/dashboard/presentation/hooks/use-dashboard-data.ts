'use client';

import { useEffect, useState } from 'react';

export interface Section<T> {
  data: T;
  error: unknown;
}

/**
 * Load independent dashboard sections in parallel. One failing section does not
 * hide the others (Angular subscribed to each use case separately).
 */
export function useDashboardSections<T extends Record<string, unknown>>(
  loaders: { [K in keyof T]: () => Promise<T[K]> },
  fallback: T
) {
  const [sections, setSections] = useState<
    { [K in keyof T]: Section<T[K]> } | null
  >(null);

  useEffect(() => {
    let cancelled = false;
    const keys = Object.keys(loaders) as (keyof T)[];
    Promise.allSettled(keys.map((k) => loaders[k]())).then((results) => {
      if (cancelled) return;
      const out = {} as { [K in keyof T]: Section<T[K]> };
      results.forEach((r, i) => {
        const k = keys[i];
        out[k] =
          r.status === 'fulfilled'
            ? { data: r.value as T[typeof k], error: null }
            : { data: fallback[k], error: r.reason };
      });
      setSections(out);
    });
    return () => {
      cancelled = true;
    };
    // loaders/fallback are static per page
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { sections, loading: sections === null };
}
