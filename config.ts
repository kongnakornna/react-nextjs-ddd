export const SESSION_COOKIE = 'auth_session';

// HttpOnly cookies set by the FastAPI backend (fastapiiot) on
// POST /api/v1/authentication/login — names come from its COOKIES_* settings.
export const BACKEND_ACCESS_TOKEN_COOKIE = 'access_token';
export const BACKEND_REFRESH_TOKEN_COOKIE = 'refresh_token';
export const BACKEND_AUTH_COOKIES = ['access_token', 'refresh_token', 'token_type', 'hub_device'] as const;
export const PASSWORD_SALT_ROUNDS = 10;
