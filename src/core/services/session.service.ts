'use client';

import { useEffect } from 'react';

import { redirectToLogout, refreshSessionStatus } from '../http/api-client';

/**
 * Keeps the FastAPI session alive and signs the user out when it is gone.
 *
 * - Every `SESSION_REFRESH_MINUTES` (default 30) → `PATCH /api/v1/authentication/refresh`
 *   (HttpOnly refresh_token cookie → new access_token cookie).
 * - Refresh answers 401/403 → `/logout?reason=expired` (clears cookies → /sign-in).
 * - Network error / 5xx → keep the user signed in and try again on the next tick.
 * - The last refresh time is shared through localStorage, so several open tabs
 *   refresh once per interval, not once each.
 * - When the page loads with no record of a refresh (new browser / cleared storage)
 *   it checks right away, so a stale cookie is caught on the first visit.
 *
 * Between refreshes the access token (15 min on FastAPI) may expire; the API client
 * then refreshes on the first 401 and retries — see `apiRequest`.
 */

const DEFAULT_MINUTES = 30;
const parsed = Number(process.env.NEXT_PUBLIC_SESSION_REFRESH_MINUTES);
export const SESSION_REFRESH_MINUTES = Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_MINUTES;
export const SESSION_REFRESH_MS = SESSION_REFRESH_MINUTES * 60 * 1000;

/** How often the keeper wakes up to see whether a refresh is due. */
const TICK_MS = 60 * 1000;
const STORAGE_KEY = 'icmon_session_refreshed_at';

function readLast(): number | null {
  try {
    const v = Number(window.localStorage.getItem(STORAGE_KEY));
    return Number.isFinite(v) && v > 0 ? v : null;
  } catch {
    return null;
  }
}

function writeLast(at: number): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(at));
  } catch {
    // storage blocked — each tab then refreshes on its own schedule
  }
}

/** Forget the last refresh (call after sign-in / sign-out). */
export function resetSessionClock(at: number | null = Date.now()): void {
  try {
    if (at === null) window.localStorage.removeItem(STORAGE_KEY);
    else writeLast(at);
  } catch {
    // ignore
  }
}

/** `true` when a refresh is due. Exported for tests. */
export function isRefreshDue(last: number | null, now: number, intervalMs = SESSION_REFRESH_MS): boolean {
  return last === null || now - last >= intervalMs;
}

let inFlight = false;

/** Refresh now if due. Returns the outcome (or 'skipped'). */
export async function checkSession(force = false): Promise<'ok' | 'expired' | 'error' | 'skipped'> {
  if (inFlight) return 'skipped';
  const now = Date.now();
  if (!force && !isRefreshDue(readLast(), now)) return 'skipped';

  inFlight = true;
  // Claim the slot first so other tabs skip this round.
  writeLast(now);
  try {
    const result = await refreshSessionStatus();
    if (result === 'expired') {
      resetSessionClock(null);
      redirectToLogout('expired');
    } else if (result === 'error') {
      // let the next tick retry instead of waiting a full interval
      resetSessionClock(now - SESSION_REFRESH_MS + TICK_MS);
    }
    return result;
  } finally {
    inFlight = false;
  }
}

/** Mount once in every signed-in layout. */
export function useSessionKeeper(): void {
  useEffect(() => {
    void checkSession();
    const timer = window.setInterval(() => void checkSession(), TICK_MS);
    const onVisible = () => {
      if (document.visibilityState === 'visible') void checkSession();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);
}
