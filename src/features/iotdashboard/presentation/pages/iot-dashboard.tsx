'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';

import { useI18n } from '@/src/core/services/i18n.service';
import { ApiErrorView } from '@/src/core/ui/api-unavailable';
import { tf } from '@/src/core/ui/tf';
import { WelcomeIllustration } from '@/src/features/dashboard/presentation/components/welcome-illustration';
import { SMARTHOME_LOCATION } from '@/src/features/smarthome/presentation/smarthome.config';
import type { IotDashboardSummary } from '../../domain/entities/iot-dashboard.entity';
import { healthyRate, percent } from '../../domain/services/summarize';
import { iotDashboard } from '../iotdashboard.container';

const REFRESH_MS = 10000;
const fmt = (n: number) => new Intl.NumberFormat().format(n);

/**
 * IoT Dashboard — UI from features/dashboard (main-dashboard), data from
 * FastAPI `GET /iot/monitordevicegroup?bucket=` (via the smarthome feature).
 */
export default function IotDashboardPage() {
  const { t, lang } = useI18n();
  const [bucket, setBucket] = useState(SMARTHOME_LOCATION.bucket);
  const [draft, setDraft] = useState(SMARTHOME_LOCATION.bucket);
  const [summary, setSummary] = useState<IotDashboardSummary | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const s = await iotDashboard.getSummary.execute({ bucket, lang });
      setSummary(s);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [bucket, lang]);

  useEffect(() => {
    setLoading(true);
    void load();
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void load();
    }, REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [load]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const next = draft.trim();
    if (next) setBucket(next);
  };

  const s = summary;
  const rate = s ? healthyRate(s) : 0;
  const v = (n: number | undefined) => (s && n !== undefined ? fmt(n) : '–');
  const L = (key: string, fallback: string) =>
    tf(t, `iotDashboard.${key}`, fallback);

  return (
    <>
      <div className="page-header d-print-none">
        <div className="row g-2 align-items-center">
          <div className="col">
            <div className="page-pretitle">
              {L('pretitle', 'IoT Monitoring')}
            </div>
            <h1 className="page-title">{L('title', 'IoT Dashboard')}</h1>
          </div>
          <div className="col-auto ms-auto d-print-none">
            <form className="d-flex gap-2" onSubmit={onSubmit}>
              <input
                className="form-control"
                style={{ width: 180 }}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Bucket"
                aria-label="Bucket"
              />
              <button type="submit" className="btn btn-primary">
                {L('load', 'Load')}
              </button>
              <Link
                href="/monitoring/smarthome"
                className="btn btn-outline-secondary"
              >
                SmartHome
              </Link>
            </form>
          </div>
        </div>
      </div>

      {error ? (
        <div className="card mt-3">
          <ApiErrorView error={error} />
        </div>
      ) : null}

      {loading && !s ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">{t('dashboard.loading')}</span>
          </div>
        </div>
      ) : (
        <div className="row row-deck row-cards mt-1">
          {/* welcome — same card as features/dashboard */}
          <div className="col-sm-12 col-lg-6">
            <div className="card card-gradient">
              <div className="card-body">
                <div className="row gy-3">
                  <div className="col-12 col-sm-7 d-flex flex-column">
                    <h3 className="h2">{L('welcome', 'IoT overview')}</h3>
                    <p className="text-secondary">
                      Bucket <strong>{s?.bucket || bucket}</strong>
                      {s?.timestamp && ` · ${s.timestamp}`}
                    </p>
                    <div className="row g-5 mt-auto">
                      <div className="col-auto">
                        <div className="subheader">
                          {L('healthyRate', 'Healthy rate')}
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
                        <div className="subheader">{L('normal', 'Normal')}</div>
                        <div className="d-flex align-items-baseline">
                          <div className="h3 me-2">{v(s?.normalDevices)}</div>
                          <div className="text-secondary small">
                            {t('dashboard.ofTotal')} {v(s?.totalDevices)}
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
          {[
            {
              label: t('dashboard.totalDevices'),
              value: s?.totalDevices,
              bar: 100,
              cls: 'bg-primary',
            },
            {
              label: L('warning', 'Warning'),
              value: s?.warningDevices,
              bar: percent(s?.warningDevices ?? 0, s?.totalDevices ?? 0),
              cls: 'bg-warning',
            },
            {
              label: L('alarm', 'Alarm'),
              value: s?.alarmDevices,
              bar: percent(s?.alarmDevices ?? 0, s?.totalDevices ?? 0),
              cls: 'bg-danger',
            },
            {
              label: L('controlsOn', 'IO Control ON'),
              value: s?.controlsOn,
              suffix: s ? ` / ${fmt(s.controllable)}` : '',
              bar: percent(s?.controlsOn ?? 0, s?.controllable ?? 0),
              cls: 'bg-success',
            },
          ].map((c) => (
            <div key={c.label} className="col-sm-6 col-lg-3">
              <div className="card">
                <div className="card-body">
                  <div className="subheader">{c.label}</div>
                  <div className="h1 mb-3">
                    {v(c.value)}
                    {c.suffix && (
                      <span className="text-secondary fs-4">{c.suffix}</span>
                    )}
                  </div>
                  <div className="progress progress-sm">
                    <div
                      className={`progress-bar ${c.cls}`}
                      style={{ width: `${s ? c.bar : 0}%` }}
                      role="progressbar"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* groups — like "Job Status" in features/dashboard */}
          <div className="col-lg-6">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">{L('groups', 'Device groups')}</h3>
              </div>
              <div className="card-body">
                {s?.groups.length ? (
                  <div className="divide-y">
                    {s.groups.map((g) => (
                      <div key={g.key}>
                        <div className="d-flex justify-content-between">
                          <strong>{g.name}</strong>
                          <span className="text-secondary">
                            {fmt(g.total)}
                            {g.warning > 0 && (
                              <span className="badge bg-warning ms-2">
                                {g.warning}
                              </span>
                            )}
                            {g.alarm > 0 && (
                              <span className="badge bg-danger ms-1">
                                {g.alarm}
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="progress progress-separated progress-sm mt-2">
                          <div
                            className="progress-bar bg-success"
                            style={{ width: `${percent(g.normal, g.total)}%` }}
                          />
                          <div
                            className="progress-bar bg-warning"
                            style={{ width: `${percent(g.warning, g.total)}%` }}
                          />
                          <div
                            className="progress-bar bg-danger"
                            style={{ width: `${percent(g.alarm, g.total)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-secondary text-center py-4">
                    {t('dashboard.noData')}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* active alerts — like "Top Parts" table in features/dashboard */}
          <div className="col-lg-6">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">{t('dashboard.activeAlerts')}</h3>
              </div>
              <div className="card-table table-responsive">
                <table className="table table-vcenter">
                  <thead>
                    <tr>
                      <th>{L('device', 'Device')}</th>
                      <th>{L('value', 'Value')}</th>
                      <th>{L('status', 'Status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {s?.alerts.slice(0, 10).map((a) => (
                      <tr key={a.id}>
                        <td>
                          {a.name}
                          <div className="text-secondary small">{a.group}</div>
                        </td>
                        <td className="text-secondary">{a.display}</td>
                        <td>
                          <span
                            className={`badge ${a.level === 'alarm' ? 'bg-danger' : 'bg-warning'}`}
                          >
                            {a.title || a.level}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {!s?.alerts.length && (
                      <tr>
                        <td
                          colSpan={3}
                          className="text-center text-secondary py-4"
                        >
                          {L('noAlerts', 'No active alerts')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
