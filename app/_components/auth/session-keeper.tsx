'use client';

import { useSessionKeeper } from '@/src/core/services/session.service';

/**
 * Mount once in each signed-in layout: refreshes the FastAPI token every
 * 30 minutes and redirects to /logout when the session has expired.
 * See src/core/services/session.service.ts.
 */
export function SessionKeeper() {
  useSessionKeeper();
  return null;
}
