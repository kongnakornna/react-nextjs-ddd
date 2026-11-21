'use client';

import { useI18n } from '@/src/core/services/i18n.service';
import { ApiErrorView } from '@/src/core/ui/api-unavailable';
import { tf } from '@/src/core/ui/tf';
import type {
  DashboardStats,
  JobStatusSummary,
  RevenueData,
  TopPartData,
} from '../../domain/entities/dashboard-stats.entity';
import {
  jobStatusBadge,
  jobStatusLabel,
  jobStatusPercent,
  onlineRate,
  partPercent,
  revenueBarHeight,
  totalRevenue,
} from '../../domain/services/dashboard-metrics';
import { WelcomeIllustration } from '../components/welcome-illustration';
import { dashboard } from '../dashboard.container';
import { useDashboardSections } from '../hooks/use-dashboard-data';

const fmt = (n: number) => new Intl.NumberFormat().format(n);
const thb = (n: number) =>
  new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0,
  }).format(n);

/** Static demo blocks kept from the Angular template (no backend data). */
const STORAGE_PARTS = [
  {
    key: 'dashboard.regular',
    label: 'Regular',
    size: '915MB',
    pct: 44,
    cls: 'bg-primary',
  },
  {
    key: 'dashboard.system',
    label: 'System',
    size: '415MB',
    pct: 19,
    cls: 'bg-info',
  },
  {
    key: 'dashboard.shared',
    label: 'Shared',
    size: '201MB',
    pct: 9,
    cls: 'bg-success',
  },
  { key: 'dashboard.free', label: 'Free', size: '612MB', pct: 0, cls: '' },
];
const VISITED_PAGES = [
  {
    page: '/',
    visitors: 4896,
    unique: 3654,
    bounce: '82.54%',
    points: '0,20 10,16 20,18 30,10 40,14 50,8 60,12 70,6 80,8',
  },
  {
    page: '/form-elements.html',
    visitors: 3652,
    unique: 3215,
    bounce: '76.29%',
    points: '0,16 10,20 20,14 30,18 40,12 50,16 60,8 70,12 80,6',
  },
  {
    page: '/index.html',
    visitors: 3256,
    unique: 2865,
    bounce: '72.65%',
    points: '0,14 10,18 20,12 30,16 40,10 50,14 60,6 70,10 80,4',
  },
  {
    page: '/icons.html',
    visitors: 986,
    unique: 865,
    bounce: '44.89%',
    points: '0,20 10,16 20,18 30,12 40,16 50,10 60,12 70,8 80,10',
  },
];

interface Data extends Record<string, unknown> {
  stats: DashboardStats | null;
  revenue: RevenueData[];
  jobStatus: JobStatusSummary[];
  topParts: TopPartData[];
}

/** Port of icmonangular features/dashboard/presentation/pages/main-dashboard. */
export default function MainDashboardPage() {
  const { t } = useI18n();
  const { sections, loading } = useDashboardSections<Data>(
    {
      stats: () => dashboard.getStats.execute(),
      revenue: () => dashboard.getRevenueChart.execute('monthly'),
      jobStatus: () => dashboard.getJobStatus.execute(),
      topParts: () => dashboard.getTopParts.execute(5),
    },
    { stats: null, revenue: [], jobStatus: [], topParts: [] }
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
  const jobs = sections.jobStatus.data;
  const parts = sections.topParts.data;
  const rate = s ? onlineRate(s) : 0;
  const val = (n: number | undefined) => (s && n !== undefined ? fmt(n) : '–');
  const noData = (
    <span className="text-secondary">{t('dashboard.noData')}</span>
  );

  return (
    <>
      <div className="page-header d-print-none">
        <div className="row g-2 align-items-center">
          <div className="col">
            <div className="page-pretitle">{t('dashboard.overview')}</div>
            <h1 className="page-title">{t('dashboard.title')}</h1>
          </div>
          <div className="col-auto ms-auto d-print-none">
            <div className="btn-list">
              <span className="d-none d-sm-inline">
                <a
                  href="#"
                  className="btn btn-outline-secondary"
                  onClick={(e) => e.preventDefault()}
                >
                  {t('dashboard.newView')}
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>

      {sections.stats.error ? (
        <div className="card mt-3">
          <ApiErrorView error={sections.stats.error} />
        </div>
      ) : null}

      <div className="row row-deck row-cards mt-1">
        {/* welcome */}
        <div className="col-sm-12 col-lg-6">
          <div className="card card-gradient">
            <div className="card-body">
              <div className="row gy-3">
                <div className="col-12 col-sm-7 d-flex flex-column">
                  <h3 className="h2">{t('dashboard.welcome')}</h3>
                  <p className="text-secondary">
                    {t('dashboard.welcomeMessage')}
                  </p>
                  <div className="row g-5 mt-auto">
                    <div className="col-auto">
                      <div className="subheader">
                        {tf(t, 'dashboard.onlineRate', 'Online rate')}
                      </div>
                      <div className="h3 me-2">{s ? `${rate}%` : '–'}</div>
                      <div className="progress progress-sm">
                        <div
                          className="progress-bar bg-success"
                          style={{ width: `${rate}%` }}
                          role="progressbar"
                          aria-valuenow={rate}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                      </div>
                    </div>
                    <div className="col-auto">
                      <div className="subheader">
                        {t('dashboard.onlineDevices')}
                      </div>
                      <div className="d-flex align-items-baseline">
                        <div className="h3 me-2">{val(s?.onlineDevices)}</div>
                        <div className="text-secondary small">
                          {t('dashboard.ofTotal')} {val(s?.totalDevices)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-12 col-sm-5 d-flex justify-content-center">
                  <WelcomeIllustration />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* stat cards */}
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="subheader">{t('dashboard.totalDevices')}</div>
              <div className="h1 mb-0 me-2">{val(s?.totalDevices)}</div>
              <div className="text-secondary mt-2">
                {t('dashboard.allRegisteredDevices')}
              </div>
            </div>
            <div className="position-relative p-3">
              <svg
                className="w-100"
                height="40"
                viewBox="0 0 100 40"
                preserveAspectRatio="none"
                aria-hidden
              >
                <polyline
                  fill="none"
                  stroke="var(--tblr-primary)"
                  strokeWidth="2"
                  points="0,30 12,26 24,28 36,20 48,24 60,16 72,20 84,12 100,16"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="subheader">{t('dashboard.onlineDevices')}</div>
              <div className="h1 mb-0 me-2">{val(s?.onlineDevices)}</div>
            </div>
            <div className="position-relative p-3">
              <svg
                className="w-100"
                height="40"
                viewBox="0 0 100 40"
                preserveAspectRatio="none"
                aria-hidden
              >
                <polyline
                  fill="none"
                  stroke="var(--tblr-success)"
                  strokeWidth="2"
                  points="0,12 12,18 24,14 36,24 48,20 60,30 72,26 84,34 100,28"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="subheader">{t('dashboard.todayCommands')}</div>
              <div className="h1 mb-3">{val(s?.todayCommands)}</div>
              <div className="progress progress-sm">
                <div
                  className="progress-bar bg-primary"
                  style={{ width: '75%' }}
                  role="progressbar"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="subheader">{t('dashboard.activeAlerts')}</div>
              <div className="h1 mb-3">{val(s?.activeAlerts)}</div>
              <div className="progress progress-sm">
                <div
                  className="progress-bar bg-danger"
                  style={{ width: '50%' }}
                  role="progressbar"
                />
              </div>
            </div>
          </div>
        </div>

        {/* revenue */}
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">{t('dashboard.revenueMonthly')}</h3>
            </div>
            <div className="card-body">
              <div className="d-flex align-items-baseline mb-3">
                <div className="h2 mb-0 me-2">{thb(totalRevenue(revenue))}</div>
                <span className="text-secondary small">
                  {t('dashboard.totalRevenuePeriod')}
                </span>
              </div>
              {revenue.length ? (
                <div
                  className="d-flex align-items-end"
                  style={{ height: 160, gap: 6 }}
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
                          minHeight: 4,
                        }}
                        title={thb(d.amount)}
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
                  style={{ height: 160 }}
                >
                  {noData}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* job status */}
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">{t('dashboard.jobStatus')}</h3>
            </div>
            <div className="card-body">
              {jobs.length ? (
                <div className="divide-y">
                  {jobs.map((j) => (
                    <div key={j.status}>
                      <div className="text-truncate">
                        <span
                          className={`badge me-2 ${jobStatusBadge(j.status)}`}
                        >
                          {t(jobStatusLabel(j.status))}
                        </span>
                        <strong>{fmt(j.count)}</strong>
                      </div>
                      <div className="progress progress-sm mt-2">
                        <div
                          className={`progress-bar ${jobStatusBadge(j.status)}`}
                          style={{
                            width: `${jobStatusPercent(j.count, jobs)}%`,
                          }}
                          role="progressbar"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">{noData}</div>
              )}
            </div>
          </div>
        </div>

        {/* locations (placeholder in Angular too) */}
        <div className="col-lg-6">
          <div className="card">
            <div className="card-body">
              <h3 className="card-title">{t('dashboard.locations')}</h3>
              <div className="ratio ratio-21x9">
                <div className="d-flex align-items-center justify-content-center flex-column text-secondary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="icon icon-md mb-2"
                    aria-hidden
                  >
                    <path d="M12 21s-7-4.35-9-8.5C1.5 9 3.5 5 8 5s6 2.5 6 2.5S16 3.5 20.5 4.5 23 9 21 12.5c-2 4.15-9 8.5-9 8.5Z" />
                    <path d="M12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                  </svg>
                  <div>{t('dashboard.mapPlaceholder')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* storage (static demo) */}
        <div className="col-lg-6">
          <div className="card">
            <div className="card-body">
              <p className="mb-3">
                {t('dashboard.usingStorage')} <strong>6,854 MB</strong>{' '}
                <span className="text-secondary">
                  {t('dashboard.ofStorage')} 8 GB
                </span>
              </p>
              <div className="progress progress-separated mb-3">
                {STORAGE_PARTS.filter((p) => p.pct).map((p) => (
                  <div
                    key={p.key}
                    className={`progress-bar ${p.cls}`}
                    role="progressbar"
                    style={{ width: `${p.pct}%` }}
                  />
                ))}
              </div>
              <div className="row">
                {STORAGE_PARTS.map((p) => (
                  <div
                    key={p.key}
                    className="col-auto d-flex align-items-center px-2"
                  >
                    <span className={`legend me-2 ${p.cls}`} />
                    <span>{tf(t, p.key, p.label)}</span>
                    <span className="d-none d-md-inline d-lg-none d-xxl-inline ms-2 text-secondary">
                      {p.size}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* top parts */}
        <div className="col-lg-6">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">{t('dashboard.topParts')}</h3>
            </div>
            <div className="card-table table-responsive">
              <table className="table table-vcenter">
                <thead>
                  <tr>
                    <th>{t('dashboard.partName')}</th>
                    <th>{t('dashboard.count')}</th>
                    <th className="w-25">{t('dashboard.usage')}</th>
                  </tr>
                </thead>
                <tbody>
                  {parts.map((p) => (
                    <tr key={p.partName}>
                      <td>{p.partName}</td>
                      <td className="text-secondary">{fmt(p.count)}</td>
                      <td>
                        <div className="progress progress-sm">
                          <div
                            className="progress-bar bg-primary"
                            style={{ width: `${partPercent(p.count, parts)}%` }}
                            role="progressbar"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                  {parts.length === 0 && (
                    <tr>
                      <td colSpan={3} className="text-center py-4">
                        {noData}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* most visited pages (static demo) */}
        <div className="col-md-12 col-lg-8">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">{t('dashboard.mostVisitedPages')}</h3>
            </div>
            <div className="card-table table-responsive">
              <table className="table table-vcenter">
                <thead>
                  <tr>
                    <th>{t('dashboard.pageName')}</th>
                    <th>{t('dashboard.visitors')}</th>
                    <th>{t('dashboard.unique')}</th>
                    <th colSpan={2}>{t('dashboard.bounceRate')}</th>
                  </tr>
                </thead>
                <tbody>
                  {VISITED_PAGES.map((r) => (
                    <tr key={r.page}>
                      <td>{r.page}</td>
                      <td className="text-secondary">{fmt(r.visitors)}</td>
                      <td className="text-secondary">{fmt(r.unique)}</td>
                      <td className="text-secondary">{r.bounce}</td>
                      <td className="text-end w-1">
                        <svg
                          width="80"
                          height="24"
                          viewBox="0 0 80 24"
                          aria-hidden
                        >
                          <polyline
                            fill="none"
                            stroke="var(--tblr-primary)"
                            strokeWidth="2"
                            points={r.points}
                          />
                        </svg>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* tabler icons promo */}
        <div className="col-md-6 col-lg-4">
          <div
            className="card border-primary"
            style={{
              background:
                'color-mix(in srgb, var(--tblr-primary) 4%, var(--tblr-bg-surface))',
            }}
          >
            <div className="card-body">
              <h3 className="h2">{t('dashboard.tablerIcons')}</h3>
              <div className="text-secondary">
                {t('dashboard.tablerIconsShort')}
              </div>
              <div className="mt-3">
                <a
                  href="https://tabler.io/icons"
                  className="btn btn-primary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('dashboard.downloadIcons')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
