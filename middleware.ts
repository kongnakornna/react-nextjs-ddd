import {
  BACKEND_ACCESS_TOKEN_COOKIE,
  BACKEND_REFRESH_TOKEN_COOKIE,
  SESSION_COOKIE,
} from '@/config';

import { NextResponse, type NextRequest } from 'next/server';

// '/logout' clears the auth cookies and forwards to /sign-in (app/logout/route.ts).
const PUBLIC_PATHS = ['/sign-in', '/sign-up', '/forgot-password', '/logout'];

const ROUTE_PERMISSIONS: Record<string, string[]> = {
  '/dashboard': ['admin', 'user'],
  '/customers': ['admin', 'user'],
  '/quotations': ['admin', 'user'],
  '/purchase-orders': ['admin', 'user'],
  '/products': ['admin', 'user'],
  '/payments': ['admin', 'user'],
  '/documents': ['admin', 'user'],
  '/email': ['admin'],
  '/batch': ['admin'],
  '/iot': ['admin', 'user'],
  '/iotmonitoring': ['admin', 'user'],
  '/mqtt': ['admin'],
  '/wos': ['admin', 'user'],
  '/jobs': ['admin', 'user'],
  '/reports': ['admin', 'user'],
  '/monitoring': ['admin', 'user'],
  '/monitoring/smarthome/dashboardsetting': ['admin', 'user'],
  '/ai-analytics': ['admin'],
  '/ai-chatbot': ['admin', 'user'],
  '/settings': ['admin'],
  '/user': ['admin'],
};

function getRoutePermission(pathname: string): string[] | null {
  const sortedKeys = Object.keys(ROUTE_PERMISSIONS).sort((a, b) => b.length - a.length);
  for (const route of sortedKeys) {
    if (pathname.startsWith(route)) {
      return ROUTE_PERMISSIONS[route];
    }
  }
  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Signed in via the FastAPI backend (access/refresh cookies) or the local
  // Next session. The refresh cookie counts too: the access token lives only
  // 15 min and can be renewed with PATCH /api/v1/authentication/refresh.
  // Presence check only — the backend validates the token on every API call.
  const hasBackendSession =
    request.cookies.has(BACKEND_ACCESS_TOKEN_COOKIE) ||
    request.cookies.has(BACKEND_REFRESH_TOKEN_COOKIE);
  const hasLocalSession = request.cookies.has(SESSION_COOKIE);

  // Not signed in, or every session cookie has expired (the browser drops a
  // cookie once its Max-Age passes) → /logout clears leftovers → /sign-in.
  // An expired *token* inside a still-present cookie is caught client-side:
  // the API client / session keeper get 401 from refresh → /logout?reason=expired.
  if (!hasBackendSession && !hasLocalSession) {
    const logout = new URL('/logout', request.url);
    logout.searchParams.set('reason', 'unauthenticated');
    logout.searchParams.set('next', pathname + request.nextUrl.search);
    return NextResponse.redirect(logout);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip static files in /public (img, assets, i18n, ...) so they are not redirected to /sign-in
    '/((?!api|backend/|_next/static|_next/image|img/|assets/|i18n|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|json|woff2?|ttf|map)$).*)',
  ],
};
