/**
 * Backend endpoints (fastapiiot) — relative to the `/api/v1` prefix.
 * Source: c:\github\fastapiiot openapi.json / Postman collection "ERPIoT".
 *
 * The backend accepts paths both with and without a trailing slash, so none is
 * used here: Next.js 308-redirects `/path/` → `/path` before the proxy rewrite.
 *
 * Entries marked `NOT IN BACKEND` have no route on fastapiiot yet (→ 404).
 */
export const API_ENDPOINTS = {
  auth: {
    login: '/authentication/login', // POST x-www-form-urlencoded (grant_type=password)
    signin: '/authentication/login', // alias: backend has no separate sign-in
    signUp: '/authentication/sign-up', // POST json
    logout: '/authentication/logout', // DELETE
    refresh: '/authentication/refresh', // PATCH, uses refresh_token cookie
    forgotPassword: '/authentication/forgot-password', // POST { email }
    resetPassword: '/authentication/reset-password', // POST { code, password, confirm_password }
    lockScreen: '/authentication/lock-screen', // POST
    twoStepVerification: '/authentication/two-step-verification', // POST
    twoStepCode: '/authentication/two-step-code', // POST
    me: '/user/me', // GET
    register: '/authentication/sign-up',
    logoutall: '/auth/logoutall', // NOT IN BACKEND
    verifyEmail: '/auth/verifyemail', // NOT IN BACKEND
    publicKey: '/auth/publickey', // NOT IN BACKEND
    permissions: '/auth/permissions', // NOT IN BACKEND
  },
  users: {
    me: '/user/me', // GET
    create: '/user', // POST json
    list: '/user/list', // NOT IN BACKEND
    detail: (id: string) => `/user/${id}`, // NOT IN BACKEND
    update: (id: string) => `/user/${id}`, // NOT IN BACKEND
    delete: (id: string) => `/user/${id}`, // NOT IN BACKEND
    updateRole: (id: string) => `/user/${id}/role`, // NOT IN BACKEND
    updatePassword: (id: string) => `/user/${id}/updatepass`, // NOT IN BACKEND
    logoutall: (id: string) => `/user/${id}/logoutall`, // NOT IN BACKEND
    updateMe: '/user/me', // NOT IN BACKEND (only GET exists)
    changeMyPassword: '/user/me/updatepass', // NOT IN BACKEND
  },
  roles: {
    // NOT IN BACKEND
    list: '/roles',
    detail: (id: number) => `/roles/${id}`,
    create: '/roles',
    update: (id: number) => `/roles/${id}`,
    delete: (id: number) => `/roles/${id}`,
    permissions: (id: number) => `/roles/${id}/permissions`,
  },
  permissions: { list: '/permissions' }, // NOT IN BACKEND
};
