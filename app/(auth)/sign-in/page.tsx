'use client';

import { useI18n } from '@/src/core/services/i18n.service';
import { AuthApiDataSource } from '@/src/features/auth/data/datasources/auth.api.datasource';

const authApi = new AuthApiDataSource();

import Link from 'next/link';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { resetSessionClock } from '@/src/core/services/session.service';
import { tf } from '@/src/core/ui/tf';

/** Only same-site relative paths (no open redirect), never back to auth pages. */
function safeNext(raw: string | null): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return '/dashboard';
  if (raw.startsWith('/logout') || raw.startsWith('/sign-in')) return '/dashboard';
  return raw;
}

export default function SignInPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePassword = () => setPasswordVisible(!passwordVisible);

  // Set by /logout: ?reason=expired|unauthenticated&next=/page (read after mount → no hydration mismatch)
  const [reason, setReason] = useState<string | null>(null);
  const [next, setNext] = useState('/dashboard');
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setReason(q.get('reason'));
    setNext(safeNext(q.get('next')));
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      // POST /api/v1/authentication/login (form-urlencoded, grant_type=password)
      // → Next proxy → FastAPI :8000. The backend sets HttpOnly
      // access_token / refresh_token cookies that middleware.ts checks.
      await authApi.login({ username, password });
      resetSessionClock(); // fresh tokens → next refresh in 30 min
      router.push(next);
    } catch (err: unknown) {
      const { status, message } = err as Error & { status?: number };
      if (status === 401) {
        setError(message || t('login.invalidCredentials'));
      } else if (status === 422) {
        setError(message || t('login.validationError'));
      } else {
        setError(message || t('errors.unknown'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="card card-md">
        <div className="card-body">
          <h2 className="h2 text-center mb-4">{t('login.title')}</h2>
          {!error && reason === 'expired' && (
            <div className="alert alert-warning mb-3" role="status">
              {tf(t, 'login.sessionExpired', 'Your session has expired. Please sign in again.')}
            </div>
          )}
          {!error && reason === 'unauthenticated' && (
            <div className="alert alert-info mb-3" role="status">
              {tf(t, 'login.pleaseSignIn', 'Please sign in to continue.')}
            </div>
          )}
          {error && <div className="alert alert-danger mb-3">{error}</div>}
          <form onSubmit={onSubmit} autoComplete="off">
            <div className="mb-3">
              <label className="form-label">{t('login.username')}</label>
              <input
                type="text"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t('login.username')}
                autoComplete="username"
                required
              />
            </div>
            <div className="mb-2">
              <label className="form-label">
                {t('login.password')}
                <span className="form-label-description">
                  <Link href="/forgot-password">{t('login.forgotPassword')}</Link>
                </span>
              </label>
              <div className="input-group input-group-flat">
                <input
                  type={passwordVisible ? 'text' : 'password'}
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('login.password')}
                  autoComplete="current-password"
                  required
                />
                <span className="input-group-text">
                  <button
                    type="button"
                    className="link-secondary bg-transparent border-0 p-0"
                    title="Toggle password"
                    onClick={togglePassword}
                  >
                    {passwordVisible ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-sm">
                        <path d="M10.585 10.585a2 2 0 0 0 2.829 2.829" />
                        <path d="M16.681 16.673a8.717 8.717 0 0 1 -4.681 1.327c-3.6 0 -6.6 -2 -9 -6c1.272 -2.12 2.712 -3.678 4.32 -4.674m2.86 -1.146a9.055 9.055 0 0 1 1.82 -.18c3.6 0 6.6 2 9 6c-.666 1.11 -1.379 2.067 -2.138 2.87" />
                        <path d="M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon icon-sm">
                        <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
                        <path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" />
                      </svg>
                    )}
                  </button>
                </span>
              </div>
            </div>
            <div className="form-footer">
              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={loading || !username || !password}
              >
                {loading && <span className="spinner-border spinner-border-sm me-2" />}
                {t('login.submit')}
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="text-center text-secondary mt-3">
        {t('login.noAccount')} <Link href="/sign-up" tabIndex={-1}>{t('login.signUp')}</Link>
      </div>
    </>
  );
}
