import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/** Minimal browser globals for the client-only session code. */
function setupWindow(pathname = '/dashboard', search = '') {
  const store = new Map<string, string>();
  const assign = vi.fn();
  vi.stubGlobal('window', {
    location: { pathname, search, assign },
    localStorage: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
    },
  });
  return { store, assign };
}

const res = (status: number, body: unknown = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

beforeEach(() => {
  vi.resetModules();
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('isRefreshDue', () => {
  it('is due with no record or after the interval', async () => {
    const { isRefreshDue, SESSION_REFRESH_MS } = await import('@/src/core/services/session.service');
    expect(SESSION_REFRESH_MS).toBe(30 * 60 * 1000);
    expect(isRefreshDue(null, 1000)).toBe(true);
    expect(isRefreshDue(0 + 1, SESSION_REFRESH_MS)).toBe(false);
    expect(isRefreshDue(1000, 1000 + SESSION_REFRESH_MS)).toBe(true);
  });
});

describe('checkSession', () => {
  it('refreshes when due and records the time', async () => {
    const { store, assign } = setupWindow();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(res(200)));
    const { checkSession } = await import('@/src/core/services/session.service');
    expect(await checkSession()).toBe('ok');
    expect(store.get('icmon_session_refreshed_at')).toBeTruthy();
    expect(assign).not.toHaveBeenCalled();
  });

  it('skips when refreshed less than 30 minutes ago', async () => {
    const { store } = setupWindow();
    store.set('icmon_session_refreshed_at', String(Date.now() - 5 * 60 * 1000));
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const { checkSession } = await import('@/src/core/services/session.service');
    expect(await checkSession()).toBe('skipped');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('redirects to /logout when the refresh token is rejected', async () => {
    const { assign } = setupWindow('/monitoring/smarthome', '?x=1');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(res(401)));
    const { checkSession } = await import('@/src/core/services/session.service');
    expect(await checkSession()).toBe('expired');
    expect(assign).toHaveBeenCalledWith('/logout?reason=expired&next=%2Fmonitoring%2Fsmarthome%3Fx%3D1');
  });

  it('keeps the user signed in when the backend is down', async () => {
    const { assign } = setupWindow();
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    const { checkSession } = await import('@/src/core/services/session.service');
    expect(await checkSession()).toBe('error');
    expect(assign).not.toHaveBeenCalled();
  });

  it('treats 5xx from refresh as an error, not an expiry', async () => {
    const { assign } = setupWindow();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(res(503)));
    const { checkSession } = await import('@/src/core/services/session.service');
    expect(await checkSession(true)).toBe('error');
    expect(assign).not.toHaveBeenCalled();
  });
});

describe('apiRequest on 401', () => {
  it('refreshes and retries once', async () => {
    setupWindow();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(res(401))
      .mockResolvedValueOnce(res(200)) // PATCH refresh
      .mockResolvedValueOnce(res(200, { details: { data: { ok: 1 } } }));
    vi.stubGlobal('fetch', fetchMock);
    const { api } = await import('@/src/core/http/api-client');
    expect(await api.get('/backend/iot/status')).toEqual({ ok: 1 });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('redirects to /logout when the refresh fails with 401', async () => {
    const { assign } = setupWindow('/dashboard');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(res(401)).mockResolvedValueOnce(res(401)));
    const { api } = await import('@/src/core/http/api-client');
    await expect(api.get('/backend/iot/status')).rejects.toMatchObject({ status: 401 });
    expect(assign).toHaveBeenCalledWith('/logout?reason=expired&next=%2Fdashboard');
  });

  it('does not redirect from the sign-in page', async () => {
    const { assign } = setupWindow('/sign-in');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(res(401)).mockResolvedValueOnce(res(401)));
    const { api } = await import('@/src/core/http/api-client');
    await expect(api.get('/backend/iot/status')).rejects.toBeTruthy();
    expect(assign).not.toHaveBeenCalled();
  });
});
