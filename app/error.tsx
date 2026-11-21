'use client';

import { useEffect } from 'react';

import { ServerErrorPage } from '@/src/features/errors';

/** Error boundary for every route below the root layout. */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <ServerErrorPage onRetry={reset} />;
}
