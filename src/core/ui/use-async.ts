'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Run an async loader on mount and whenever `deps` change.
 * Ignores results from stale calls (a newer call started meanwhile).
 */
export function useAsync<T>(loader: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const callId = useRef(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(loader, deps);

  const reload = useCallback(async () => {
    const id = ++callId.current;
    setLoading(true);
    setError(null);
    try {
      const result = await run();
      if (id === callId.current) setData(result);
    } catch (err) {
      if (id === callId.current) setError(err);
    } finally {
      if (id === callId.current) setLoading(false);
    }
  }, [run]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, error, loading, reload, setData };
}
