'use client';

import { CloudOff } from 'lucide-react';

import { isApiNotAvailable } from '../http/api-client';
import { useI18n } from '../services/i18n.service';
import { tf } from './tf';

/**
 * Shown when a feature's backend endpoint doesn't exist yet on FastAPI
 * (datasource threw ApiNotAvailableError). See docs/plan.md §5.
 */
export function ApiUnavailable({ feature, endpoint }: { feature?: string; endpoint?: string }) {
  const { t } = useI18n();
  return (
    <div className="empty py-5" role="status">
      <div className="empty-icon">
        <CloudOff className="icon icon-lg text-secondary" />
      </div>
      <p className="empty-title">{tf(t, 'common.apiUnavailableTitle', 'ยังไม่มี API สำหรับส่วนนี้')}</p>
      <p className="empty-subtitle text-secondary">
        {tf(t, 'common.apiUnavailableSubtitle', 'Backend (FastAPI) ยังไม่มี endpoint ของหน้านี้ หน้าจอจะใช้งานได้เมื่อ backend เพิ่ม API')}
      </p>
      {(feature || endpoint) && (
        <p className="text-secondary small mb-0">
          <code>{[feature, endpoint].filter(Boolean).join(' · ')}</code>
        </p>
      )}
    </div>
  );
}

/** <ApiUnavailable/> for ApiNotAvailableError, otherwise a red alert. Renders nothing without an error. */
export function ApiErrorView({ error }: { error: unknown }) {
  if (!error) return null;
  if (isApiNotAvailable(error)) return <ApiUnavailable feature={error.feature} endpoint={error.endpoint} />;
  const message = error instanceof Error ? error.message : String(error);
  return <div className="alert alert-danger">{message}</div>;
}
