'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { useI18n } from '@/src/core/services/i18n.service';

interface ErrorPageProps {
  code: string | number;
  /** i18n key prefix, e.g. 'errors.notFound' → .title / .subtitle / .backHome */
  i18nKey: string;
  fallback: { title: string; subtitle: string; backHome: string };
  href?: string;
  /** extra action, e.g. "Try again" on the 500 page */
  children?: React.ReactNode;
}

/** Port of icmonangular features/errors (not-found, unauthorized). */
export function ErrorPage({ code, i18nKey, fallback, href = '/dashboard', children }: ErrorPageProps) {
  const { t } = useI18n();
  const tr = (k: keyof ErrorPageProps['fallback']) => {
    const key = `${i18nKey}.${k}`;
    const v = t(key);
    return v && v !== key ? v : fallback[k];
  };

  return (
    <div className="page page-center" style={{ minHeight: '100dvh' }}>
      <div className="container-tight py-4">
        <div className="empty">
          <div className="empty-header text-primary error-code">{code}</div>
          <p className="empty-title">{tr('title')}</p>
          <p className="empty-subtitle text-secondary">{tr('subtitle')}</p>
          <div className="empty-action d-flex gap-2 justify-content-center flex-wrap">
            <Link href={href} className="btn btn-primary">
              <ArrowLeft className="icon" />
              {tr('backHome')}
            </Link>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <ErrorPage
      code={404}
      i18nKey="errors.notFound"
      fallback={{
        title: 'Oops… Page not found',
        subtitle: 'The page you are looking for does not exist or has been moved.',
        backHome: 'Take me home',
      }}
    />
  );
}

export function UnauthorizedPage() {
  return (
    <ErrorPage
      code={403}
      i18nKey="errors.unauthorized"
      fallback={{
        title: 'Access Denied',
        subtitle: 'You do not have permission to access this page. Please contact your administrator.',
        backHome: 'Back to Dashboard',
      }}
    />
  );
}

export function ServerErrorPage({ onRetry }: { onRetry?: () => void }) {
  const { t } = useI18n();
  const retry = t('common.retry');
  return (
    <ErrorPage
      code={500}
      i18nKey="errors.serverError"
      fallback={{
        title: t('errors.500') !== 'errors.500' ? t('errors.500') : 'Server error, please try again later',
        subtitle: t('errors.unknown') !== 'errors.unknown' ? t('errors.unknown') : 'An unknown error occurred',
        backHome: 'Back to Dashboard',
      }}
    >
      {onRetry && (
        <button type="button" className="btn" onClick={onRetry}>
          {retry !== 'common.retry' ? retry : 'Try again'}
        </button>
      )}
    </ErrorPage>
  );
}
