import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';

import { BACKEND_AUTH_COOKIES, SESSION_COOKIE } from '@/config';
import { getInjection } from '@/di/container';

const API_TARGET = process.env.API_TARGET_URL || 'http://localhost:8000';
const REASONS = new Set(['expired', 'unauthenticated', 'logout']);

/** Only same-site relative paths, never back to /logout or /sign-in. */
function safeNext(raw: string | null): string | null {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return null;
  if (raw.startsWith('/logout') || raw.startsWith('/sign-in')) return null;
  return raw;
}

/**
 * GET /logout?reason=expired|unauthenticated|logout&next=/path
 *
 * Used when there is no session or it has expired (middleware.ts, the API
 * client after a failed refresh, the 30-minute session keeper):
 *  1. revoke the FastAPI session — DELETE /api/v1/authentication/logout (best effort)
 *  2. invalidate the local Next session (auth_session), if any
 *  3. delete every auth cookie — they are HttpOnly, so only the server can
 *  4. redirect to /sign-in?reason=…&next=…
 */
export async function GET(request: NextRequest) {
  const jar = cookies();
  const reason = request.nextUrl.searchParams.get('reason');
  const next = safeNext(request.nextUrl.searchParams.get('next'));

  const present = BACKEND_AUTH_COOKIES.filter((name) => jar.has(name));
  if (present.length > 0) {
    const cookieHeader = present.map((name) => `${name}=${jar.get(name)?.value ?? ''}`).join('; ');
    try {
      await fetch(`${API_TARGET}/api/v1/authentication/logout`, {
        method: 'DELETE',
        headers: { Cookie: cookieHeader, Accept: 'application/json' },
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
      });
    } catch {
      // backend down / token already invalid — cookies are cleared below anyway
    }
  }

  const sessionId = jar.get(SESSION_COOKIE)?.value;
  if (sessionId) {
    try {
      await getInjection('ISignOutBffController')(sessionId);
    } catch {
      // unknown / expired local session — the cookie is deleted below
    }
  }

  const target = new URL('/sign-in', request.url);
  target.searchParams.set('reason', reason && REASONS.has(reason) ? reason : 'logout');
  if (next) target.searchParams.set('next', next);

  const response = NextResponse.redirect(target);
  for (const name of [...BACKEND_AUTH_COOKIES, SESSION_COOKIE]) {
    response.cookies.set(name, '', { path: '/', maxAge: 0 });
  }
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
