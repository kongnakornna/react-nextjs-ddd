'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { BACKEND_AUTH_COOKIES, SESSION_COOKIE } from '@/config';
import { getInjection } from '@/di/container';
import { SignOutAction } from '../gateway.types';

const API_TARGET = process.env.API_TARGET_URL || 'http://localhost:8000';

/**
 * Revoke the FastAPI session (DELETE /api/v1/authentication/logout) by
 * forwarding the browser's backend cookies, then drop them locally.
 * Best-effort: a failed or unreachable backend must not block sign-out.
 */
async function signOutBackend(): Promise<void> {
  const jar = cookies();
  const present = BACKEND_AUTH_COOKIES.filter((name) => jar.has(name));
  if (present.length === 0) return;

  const cookieHeader = present
    .map((name) => `${name}=${jar.get(name)?.value ?? ''}`)
    .join('; ');

  try {
    await fetch(`${API_TARGET}/api/v1/authentication/logout`, {
      method: 'DELETE',
      headers: { Cookie: cookieHeader, Accept: 'application/json' },
      cache: 'no-store',
    });
  } catch {
    // ignore — cookies are cleared below either way
  }

  for (const name of present) {
    jar.delete(name);
  }
}

export const signOutAction: SignOutAction = async () => {
  await signOutBackend();

  const sessionId = cookies().get(SESSION_COOKIE)?.value;
  if (sessionId) {
    const signOutController = getInjection('ISignOutBffController');
    const result = await signOutController(sessionId);

    if (result.status === 'success') {
      const blankCookie = result.data;
      cookies().set(blankCookie.name, blankCookie.value, blankCookie.attributes);
    }
  }

  redirect('/sign-in');
};
