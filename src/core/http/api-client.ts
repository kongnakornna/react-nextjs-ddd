/**
 * Shared HTTP client for the FastAPI backend (fastapiiot, see docs/apiflow.md).
 *
 * - `/api/v1/...`  → Next proxy `/api/:path*`      → FastAPI `/api/v1/...`
 * - `/backend/...` → Next proxy `/backend/:path*`  → FastAPI `/...` (routes without
 *   an /api prefix: `/iot/*`, `/llm/*`, `/health/`) — see next.config.mjs
 * - Cookie auth (HttpOnly access_token / refresh_token), `credentials: 'include'`.
 * - Unwraps the envelope `{ code, details: { message, data } }` → `data`.
 * - Error message prefers `details.data.errors_th`.
 * - On 401 calls `PATCH /api/v1/authentication/refresh` once, then retries.
 */
import { environment } from '../config/environment';

export const API_PREFIX = '/api/v1';
export const BACKEND_PREFIX = '/backend';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Thrown by datasources for features whose endpoints the FastAPI backend does
 * not have yet. Pages show <ApiUnavailable/> instead of an error.
 */
export class ApiNotAvailableError extends Error {
  readonly status = 501;
  constructor(
    public feature: string,
    public endpoint?: string,
  ) {
    super(`API not available on backend: ${feature}${endpoint ? ` (${endpoint})` : ''}`);
    this.name = 'ApiNotAvailableError';
  }
}

export function isApiNotAvailable(err: unknown): err is ApiNotAvailableError {
  return err instanceof ApiNotAvailableError || (err as { name?: string })?.name === 'ApiNotAvailableError';
}

/** Throw from a datasource method whose backend endpoint doesn't exist yet. */
export function notAvailable(feature: string, endpoint?: string): never {
  throw new ApiNotAvailableError(feature, endpoint);
}

export type QueryValue = string | number | boolean | null | undefined;

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** JSON body */
  body?: unknown;
  /** x-www-form-urlencoded body (e.g. OAuth2 login) */
  form?: Record<string, string>;
  query?: Record<string, QueryValue>;
  headers?: Record<string, string>;
  /** Skip the refresh-and-retry on 401 (login, refresh itself). */
  skipRefresh?: boolean;
  signal?: AbortSignal;
}

/** `/api/v1/x` or `/backend/x` → absolute URL when not using the Next proxy. */
export function resolveUrl(path: string): string {
  if (/^https?:\/\//.test(path) || environment.useProxy) return path;
  const target = environment.apiTargetUrl.replace(/\/$/, '');
  if (path.startsWith(BACKEND_PREFIX + '/')) return target + path.slice(BACKEND_PREFIX.length);
  return target + path;
}

function withQuery(url: string, query?: Record<string, QueryValue>): string {
  if (!query) return url;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== null && v !== '') params.set(k, String(v));
  }
  const qs = params.toString();
  return qs ? `${url}${url.includes('?') ? '&' : '?'}${qs}` : url;
}

/** `{ details: { data } }` → data; anything else unchanged. */
export function unwrap(body: any): any {
  if (body && typeof body === 'object' && body.details && typeof body.details === 'object' && 'data' in body.details) {
    return body.details.data;
  }
  return body;
}

export function errorMessage(body: any, status: number): string {
  const data = body?.details?.data;
  const msg =
    data?.errors_th ||
    data?.errors ||
    body?.details?.message ||
    body?.error?.msg ||
    body?.msg ||
    body?.message ||
    (Array.isArray(body?.detail) ? body.detail.map((d: any) => d?.msg).join(', ') : body?.detail);
  if (typeof msg === 'string' && msg) return msg;
  if (status === 401) return 'ไม่ได้รับอนุญาต กรุณาเข้าสู่ระบบอีกครั้ง';
  if (status === 403) return 'คุณไม่มีสิทธิ์เข้าถึง';
  if (status === 404) return 'ไม่พบข้อมูลที่ร้องขอ';
  return `Server Error (${status})`;
}

/**
 * Result of `PATCH /api/v1/authentication/refresh`:
 * - `ok`      new access_token cookie issued
 * - `expired` 401/403 — refresh token missing, expired or revoked → must sign in again
 * - `error`   network error / 5xx — backend unreachable; do NOT log the user out
 */
export type RefreshResult = 'ok' | 'expired' | 'error';

let refreshing: Promise<RefreshResult> | null = null;

/** One refresh at a time; concurrent 401s (and the session keeper) share the same call. */
export function refreshSessionStatus(): Promise<RefreshResult> {
  if (!refreshing) {
    refreshing = fetch(resolveUrl(`${API_PREFIX}/authentication/refresh`), {
      method: 'PATCH',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })
      .then((r): RefreshResult => (r.ok ? 'ok' : r.status === 401 || r.status === 403 ? 'expired' : 'error'))
      .catch((): RefreshResult => 'error')
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

/** `true` when the refresh succeeded. */
export async function refreshSession(): Promise<boolean> {
  return (await refreshSessionStatus()) === 'ok';
}

/** Route handler that clears the auth cookies and forwards to /sign-in (app/logout/route.ts). */
export const LOGOUT_PATH = '/logout';
let redirectingToLogout = false;

/**
 * Leave the app because the session is gone: `/logout?reason=…&next=<current page>`.
 * Browser only; called once even if several requests fail at the same time.
 */
export function redirectToLogout(reason: 'expired' | 'unauthenticated' = 'expired'): void {
  if (typeof window === 'undefined' || redirectingToLogout) return;
  const { pathname, search } = window.location;
  if (pathname.startsWith(LOGOUT_PATH) || pathname.startsWith('/sign-in')) return;
  redirectingToLogout = true;
  const next = encodeURIComponent(pathname + search);
  window.location.assign(`${LOGOUT_PATH}?reason=${reason}&next=${next}`);
}

export async function apiRequest<T = unknown>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { method = 'GET', body, form, query, headers = {}, skipRefresh, signal } = options;

  const init: RequestInit = {
    method,
    credentials: 'include',
    signal,
    headers: { Accept: 'application/json', ...headers },
  };
  if (form) {
    (init.headers as Record<string, string>)['Content-Type'] = 'application/x-www-form-urlencoded';
    init.body = new URLSearchParams(form).toString();
  } else if (body !== undefined) {
    (init.headers as Record<string, string>)['Content-Type'] = 'application/json';
    init.body = JSON.stringify(body);
  }

  const url = withQuery(resolveUrl(path), query);
  let response = await fetch(url, init);

  const isAuthCall = path.includes('/authentication/');
  if (response.status === 401 && !skipRefresh && !isAuthCall && typeof window !== 'undefined') {
    const refreshed = await refreshSessionStatus();
    if (refreshed === 'ok') {
      response = await fetch(url, init);
    } else if (refreshed === 'expired') {
      // Session is gone (not just a backend hiccup) → sign out and go to /sign-in.
      redirectToLogout('expired');
    }
  }

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new ApiError(response.status, errorMessage(errBody, response.status), errBody);
  }
  if (response.status === 204) return undefined as T;

  const type = response.headers.get('content-type') ?? '';
  if (type.includes('application/json')) return unwrap(await response.json()) as T;
  if (type.startsWith('text/')) return (await response.text()) as T;
  return (await response.blob()) as T;
}

export const api = {
  get: <T>(path: string, query?: ApiRequestOptions['query'], opts?: Omit<ApiRequestOptions, 'query' | 'method'>) =>
    apiRequest<T>(path, { ...opts, method: 'GET', query }),
  post: <T>(path: string, body?: unknown, opts?: Omit<ApiRequestOptions, 'body' | 'method'>) =>
    apiRequest<T>(path, { ...opts, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, opts?: Omit<ApiRequestOptions, 'body' | 'method'>) =>
    apiRequest<T>(path, { ...opts, method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown, opts?: Omit<ApiRequestOptions, 'body' | 'method'>) =>
    apiRequest<T>(path, { ...opts, method: 'PATCH', body }),
  delete: <T>(path: string, opts?: Omit<ApiRequestOptions, 'method'>) =>
    apiRequest<T>(path, { ...opts, method: 'DELETE' }),
};
