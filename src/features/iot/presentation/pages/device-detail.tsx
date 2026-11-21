'use client';

import Link from 'next/link';
import { useState } from 'react';

import { useI18n } from '@/src/core/services/i18n.service';
import { ApiErrorView } from '@/src/core/ui/api-unavailable';
import { Pagination } from '@/src/core/ui/pagination';
import { tf } from '@/src/core/ui/tf';
import { useAsync } from '@/src/core/ui/use-async';
import { iot } from '../iot.container';

const PAGE_SIZE = 10;

/**
 * Port of icmonangular iot/presentation/pages/device-detail.
 * Angular used hard-coded sample data; here it loads
 * GET /iot/devicestatus, /iot/devicestats, /iot/deviceconfig, /iot/deviceiotdata.
 */
export default function DeviceDetailPage({ deviceId }: { deviceId: string }) {
  const { t } = useI18n();
  const [page, setPage] = useState(1);

  const status = useAsync(() => iot.getDeviceStatus.execute(deviceId), [deviceId]);
  const stats = useAsync(() => iot.getDeviceStats.execute(deviceId), [deviceId]);
  const config = useAsync(() => iot.getDeviceConfig.execute(deviceId), [deviceId]);
  const data = useAsync(() => iot.getDeviceIoTData.execute(deviceId, { page, limit: PAGE_SIZE }), [deviceId, page]);

  const s = status.data;
  const deviceName = (config.data?.config?.general as { deviceName?: string } | undefined)?.deviceName ?? `Device ${deviceId}`;

  return (
    <>
      <div className="page-header d-print-none mb-3">
        <div className="row g-2 align-items-center">
          <div className="col">
            <div className="page-pretitle">{t('iot.detail')}</div>
            <h1 className="page-title">{deviceName}</h1>
          </div>
          <div className="col-auto ms-auto">
            <Link href="/iot/devices" className="btn btn-outline-secondary">{t('iot.back')}</Link>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header"><h3 className="card-title">{t('iot.deviceInfo')}</h3></div>
            <div className="card-body">
              {status.error ? (
                <ApiErrorView error={status.error} />
              ) : !s ? (
                <div className="placeholder-glow"><span className="placeholder col-12" /></div>
              ) : (
                <div className="datagrid">
                  <Item title={t('iot.deviceId')}>{s.deviceId}</Item>
                  <Item title={t('iot.status')}>
                    <span className={`badge ${s.isOnline ? 'bg-green text-green-fg' : 'bg-red text-red-fg'}`}>
                      {s.isOnline ? t('iot.onlineStatus') : t('iot.offlineStatus')}
                    </span>{' '}
                    {!s.isActive && <span className="badge bg-secondary text-secondary-fg">inactive</span>}
                  </Item>
                  <Item title={tf(t, 'iot.lastSeen', 'Last seen')}>{formatDate(s.lastSeen)}</Item>
                  <Item title={tf(t, 'iot.battery', 'Battery')}>{s.batteryLevel}%</Item>
                  <Item title={tf(t, 'iot.signal', 'Signal')}>{s.signalStrength} dBm</Item>
                  <Item title={t('iot.version')}>{s.firmwareVersion}</Item>
                  <Item title={tf(t, 'iot.uptime', 'Uptime')}>{s.uptime}</Item>
                  <Item title={t('iot.location')}>
                    {s.location ? (
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${s.location.lat}&mlon=${s.location.lng}#map=16/${s.location.lat}/${s.location.lng}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {s.location.lat}, {s.location.lng}
                      </a>
                    ) : '—'}
                  </Item>
                </div>
              )}
            </div>
          </div>

          <div className="card mt-3">
            <div className="card-header"><h3 className="card-title">{tf(t, 'iot.stats', 'Statistics')}</h3></div>
            <div className="card-body">
              {stats.error ? (
                <ApiErrorView error={stats.error} />
              ) : (
                <div className="datagrid">
                  <Item title={tf(t, 'iot.records', 'Records')}>{stats.data?.count ?? '…'}</Item>
                  <Item title={tf(t, 'iot.firstRecord', 'First record')}>{formatDate(stats.data?.firstRecord)}</Item>
                  <Item title={tf(t, 'iot.lastRecord', 'Last record')}>{formatDate(stats.data?.lastRecord)}</Item>
                </div>
              )}
            </div>
          </div>

          <div className="card mt-3">
            <div className="card-header"><h3 className="card-title">{t('iot.settings')}</h3></div>
            <div className="card-body">
              {config.error ? (
                <ApiErrorView error={config.error} />
              ) : (
                <pre className="mb-0 small" style={{ whiteSpace: 'pre-wrap' }}>
                  {config.data ? JSON.stringify(config.data.config, null, 2) : '…'}
                </pre>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card">
            <div className="card-header"><h3 className="card-title">{t('iot.sensorData')}</h3></div>
            {data.error ? (
              <div className="card-body"><ApiErrorView error={data.error} /></div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table table-vcenter card-table">
                    <thead>
                      <tr>
                        <th>{t('iot.lastUpdated')}</th>
                        <th>{t('iot.sensorData')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.data?.data ?? []).map((r) => (
                        <tr key={r.id}>
                          <td className="text-nowrap">{formatDate(r.timestamp)}</td>
                          <td><code className="small">{JSON.stringify(r.data)}</code></td>
                        </tr>
                      ))}
                      {!data.loading && (data.data?.data.length ?? 0) === 0 && (
                        <tr>
                          <td colSpan={2} className="text-center text-secondary py-4">{t('iot.noSensorData')}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="card-footer d-flex align-items-center">
                  <p className="m-0 text-secondary">{t('iot.showing')} {data.data?.pagination.total ?? 0} {t('iot.items')}</p>
                  <Pagination page={page} totalPages={data.data?.pagination.pages || 1} onChange={setPage} />
                </div>
              </>
            )}
          </div>

          {s?.lastData && Object.keys(s.lastData).length > 0 && (
            <div className="card mt-3">
              <div className="card-header"><h3 className="card-title">{tf(t, 'iot.lastData', 'Last data')}</h3></div>
              <div className="table-responsive">
                <table className="table table-vcenter card-table">
                  <thead>
                    <tr><th>{t('iot.sensor')}</th><th className="text-end">{t('iot.value')}</th></tr>
                  </thead>
                  <tbody>
                    {Object.entries(s.lastData).map(([k, v]) => (
                      <tr key={k}><td>{k}</td><td className="text-end">{String(v)}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function Item({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="datagrid-item">
      <div className="datagrid-title">{title}</div>
      <div className="datagrid-content">{children}</div>
    </div>
  );
}

function formatDate(v?: string) {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleString();
}
