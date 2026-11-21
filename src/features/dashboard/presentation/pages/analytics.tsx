'use client';

import { useI18n } from '@/src/core/services/i18n.service';
import { ApiErrorView } from '@/src/core/ui/api-unavailable';
import type {
  DashboardStats,
  RevenueData,
} from '../../domain/entities/dashboard-stats.entity';
import { revenueBarHeight } from '../../domain/services/dashboard-metrics';
import { dashboard } from '../dashboard.container';
import { useDashboardSections } from '../hooks/use-dashboard-data';

const fmt = (n: number) => new Intl.NumberFormat().format(n);

interface Data extends Record<string, unknown> {
  stats: DashboardStats | null;
  revenue: RevenueData[];
}

/** Port of icmonangular features/dashboard/presentation/pages/analytics. */
export default function AnalyticsPage() {
  const { t } = useI18n();
  const { sections, loading } = useDashboardSections<Data>(
    {
      stats: () => dashboard.getStats.execute(),
      revenue: () => dashboard.getRevenueChart.execute('monthly'),
    },
    { stats: null, revenue: [] }
  );

  if (loading || !sections) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">{t('dashboard.loading')}</span>
        </div>
      </div>
    );
  }

  const s = sections.stats.data;
  const revenue = sections.revenue.data;
  const items: { key: string; value?: number }[] = [
    { key: 'dashboard.totalDevices', value: s?.totalDevices },
    { key: 'dashboard.onlineDevices', value: s?.onlineDevices },
    { key: 'dashboard.todayCommands', value: s?.todayCommands },
    { key: 'dashboard.activeAlerts', value: s?.activeAlerts },
  ];
  const show = (v?: number) => (v === undefined ? '–' : fmt(v));

  return (
    <>
      <div className="page-header d-print-none mb-3">
        <div className="page-pretitle">{t('dashboard.overview')}</div>
        <h1 className="page-title">{t('analytics.title')}</h1>
      </div>

      {sections.stats.error ? (
        <div className="card mb-3">
          <ApiErrorView error={sections.stats.error} />
        </div>
      ) : null}

      <div className="row g-3">
        {items.map((i) => (
          <div key={i.key} className="col-md-3">
            <div className="card">
              <div className="card-body">
                <div className="subheader">{t(i.key)}</div>
                <div className="h1 mb-0">{show(i.value)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3 mt-3">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">{t('dashboard.revenueMonthly')}</h3>
            </div>
            <div className="card-body">
              {revenue.length ? (
                <div
                  className="d-flex align-items-end"
                  style={{ height: 250, gap: 8 }}
                >
                  {revenue.map((d) => (
                    <div
                      key={d.period}
                      className="flex-fill text-center h-100 d-flex flex-column justify-content-end"
                    >
                      <div
                        className="bg-primary rounded-top"
                        style={{
                          height: `${revenueBarHeight(d.amount, revenue)}%`,
                          minHeight: 10,
                        }}
                      />
                      <small className="text-secondary mt-1 d-block">
                        {d.period}
                      </small>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{ height: 250 }}
                >
                  <span className="text-secondary">
                    {t('dashboard.noData')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">{t('analytics.summary')}</h3>
            </div>
            <div className="list-group list-group-flush">
              {items.map((i) => (
                <div key={i.key} className="list-group-item">
                  <div className="d-flex justify-content-between">
                    <span>{t(i.key)}</span>
                    <strong>{show(i.value)}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
