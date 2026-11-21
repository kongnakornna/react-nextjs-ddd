'use client';

import { useState } from 'react';

import { useI18n } from '@/src/core/services/i18n.service';
import { ApiErrorView } from '@/src/core/ui/api-unavailable';
import type { DashboardReport } from '../../domain/entities/report.entity';
import {
  canDownloadReport,
  reportStatusClass,
  reportStatusLabel,
} from '../../domain/services/dashboard-metrics';
import { dashboard } from '../dashboard.container';
import { useDashboardSections } from '../hooks/use-dashboard-data';

interface Data extends Record<string, unknown> {
  reports: DashboardReport[];
}

/** Default range of the Angular page (download(reportType) → 2026-01-01 … 2026-03-31). */
const DEFAULT_RANGE = { startDate: '2026-01-01', endDate: '2026-03-31' };

/** Port of icmonangular features/dashboard/presentation/pages/reports. */
export default function DashboardReportsPage() {
  const { t } = useI18n();
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<unknown>(null);
  const { sections, loading } = useDashboardSections<Data>(
    { reports: () => dashboard.getReports.execute() },
    { reports: [] }
  );

  const download = async (reportType: string) => {
    setDownloading(true);
    setDownloadError(null);
    try {
      const blob = await dashboard.generateReport.execute({
        type: reportType,
        ...DEFAULT_RANGE,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}_report.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setDownloadError(err);
    } finally {
      setDownloading(false);
    }
  };

  const reports = sections?.reports.data ?? [];

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">{t('reports.recent')}</h3>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">{t('dashboard.loading')}</span>
          </div>
        </div>
      ) : sections?.reports.error ? (
        <ApiErrorView error={sections.reports.error} />
      ) : (
        <div className="table-responsive">
          {downloadError ? (
            <div className="p-3">
              <ApiErrorView error={downloadError} />
            </div>
          ) : null}
          <table className="table table-vcenter card-table">
            <thead>
              <tr>
                <th>{t('reports.name')}</th>
                <th>{t('reports.type')}</th>
                <th>{t('reports.createdAt')}</th>
                <th>{t('reports.status')}</th>
                <th className="w-1" />
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>{r.type}</td>
                  <td>{r.createdAt}</td>
                  <td>
                    <span className={`badge ${reportStatusClass(r.status)}`}>
                      {t(reportStatusLabel(r.status))}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      disabled={downloading || !canDownloadReport(r.status)}
                      onClick={() => void download(r.reportType)}
                    >
                      {t('reports.download')}
                    </button>
                  </td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-secondary py-4">
                    {t('reports.noReports')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
