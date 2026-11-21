'use client';

import Link from 'next/link';
import { useState } from 'react';

import { useI18n } from '@/src/core/services/i18n.service';
import { ApiErrorView } from '@/src/core/ui/api-unavailable';
import { Pagination } from '@/src/core/ui/pagination';
import { tf } from '@/src/core/ui/tf';
import { useAsync } from '@/src/core/ui/use-async';
import type { DeviceGroup } from '../../domain/entities/device.entity';
import { iot } from '../iot.container';

const PAGE_SIZE = 10;

/** Port of icmonangular iot/presentation/pages/device-list. Data: GET /iot/device, /iot/alarmdevicestatus */
export default function DeviceListPage() {
  const { t, lang } = useI18n();
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [hardwareId, setHardwareId] = useState('');
  const [applied, setApplied] = useState({ keyword: '', hardwareId: '' });

  const list = useAsync(
    () => iot.listDevicesPaginated.execute({ page, pageSize: PAGE_SIZE, lang, ...applied }),
    [page, applied, lang],
  );
  const alarms = useAsync(() => iot.getAlarmDeviceStatus.execute(), []);

  const devices = list.data?.data ?? [];
  const total = list.data?.total ?? 0;
  const totalPages = list.data?.totalPage ?? Math.max(1, Math.ceil(total / PAGE_SIZE));
  const online = devices.filter((d) => d.status === 1).length;
  const offline = devices.filter((d) => d.status === 0).length;
  const activeAlarms = (alarms.data ?? []).filter((a) => a.status === 1);

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setApplied({ keyword: keyword.trim(), hardwareId: hardwareId.trim() });
  };
  const reset = () => {
    setKeyword('');
    setHardwareId('');
    setPage(1);
    setApplied({ keyword: '', hardwareId: '' });
  };

  return (
    <>
      <div className="page-header d-print-none mb-3">
        <div className="row g-2 align-items-center">
          <div className="col">
            <div className="page-pretitle">{t('iot.subtitle')}</div>
            <h1 className="page-title">{t('iot.title')}</h1>
          </div>
          <div className="col-auto ms-auto">
            <Link href="/iot/map" className="btn btn-outline-secondary">{t('iot.mapTitle')}</Link>
          </div>
        </div>
      </div>

      <div className="row row-deck row-cards mb-3">
        <StatCard label={t('iot.totalDevices')} value={total} />
        <StatCard label={t('iot.onlineDevices')} value={online} hint={tf(t, 'iot.thisPage', 'On this page')} />
        <StatCard label={t('iot.offlineDevices')} value={offline} hint={tf(t, 'iot.thisPage', 'On this page')} />
        <StatCard label={t('iot.sensorAlerts')} value={activeAlarms.length} />
      </div>

      <div className="card mb-3">
        <form className="card-body" onSubmit={search}>
          <div className="row g-3 align-items-end">
            <div className="col-md-4">
              <label className="form-label" htmlFor="iot-keyword">{t('iot.search')}</label>
              <input id="iot-keyword" className="form-control" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder={t('iot.searchPlaceholder')} />
            </div>
            <div className="col-md-3">
              <label className="form-label" htmlFor="iot-hardware">{t('iot.hardwareId')}</label>
              <input id="iot-hardware" className="form-control" value={hardwareId} onChange={(e) => setHardwareId(e.target.value)} placeholder={t('iot.hardwareIdPlaceholder')} />
            </div>
            <div className="col-md-5 d-flex gap-2">
              <button type="submit" className="btn btn-primary">{t('iot.searchBtn')}</button>
              <button type="button" className="btn btn-outline-secondary" onClick={reset}>{t('iot.reset')}</button>
            </div>
          </div>
        </form>
      </div>

      <div className="card mb-3">
        <div className="card-header">
          <h3 className="card-title">{t('iot.deviceList')}</h3>
        </div>
        {list.error ? (
          <div className="card-body"><ApiErrorView error={list.error} /></div>
        ) : list.loading && !list.data ? (
          <Spinner label={t('iot.loading')} />
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-vcenter card-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>{t('iot.deviceName')}</th>
                    <th>{t('iot.type')}</th>
                    <th>{t('iot.status')}</th>
                    <th className="text-end">{t('iot.value')}</th>
                    <th>{t('iot.unit')}</th>
                    <th>Alarm</th>
                  </tr>
                </thead>
                <tbody>
                  {devices.map((d, i) => (
                    <tr key={`${d.deviceId}-${i}`}>
                      <td className="text-secondary">{d.deviceId}</td>
                      <td>
                        <Link href={`/iot/devices/${d.deviceId}`}>{d.deviceName || `#${d.deviceId}`}</Link>
                      </td>
                      <td>{d.typeName || '—'}</td>
                      <td><StatusBadge device={d} t={t} /></td>
                      <td className="text-end" style={{ fontVariantNumeric: 'tabular-nums' }}>{d.valueData}</td>
                      <td className="text-secondary">{d.unit}</td>
                      <td className="text-secondary">{d.alarmTitle}</td>
                    </tr>
                  ))}
                  {devices.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center text-secondary py-4">{t('iot.noSensorData')}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="card-footer d-flex align-items-center flex-wrap gap-2">
              <p className="m-0 text-secondary">
                {t('iot.showing')} {total} {t('iot.items')}
              </p>
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </div>
          </>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">{t('iot.sensorAlerts')}</h3>
        </div>
        {alarms.error ? (
          <div className="card-body"><ApiErrorView error={alarms.error} /></div>
        ) : alarms.loading && !alarms.data ? (
          <Spinner label={t('iot.loading')} />
        ) : (
          <div className="table-responsive">
            <table className="table table-vcenter card-table">
              <thead>
                <tr>
                  <th>{t('iot.deviceName')}</th>
                  <th>{t('iot.activeAlerts')}</th>
                  <th className="text-end">{t('iot.value')}</th>
                  <th>{t('iot.status')}</th>
                </tr>
              </thead>
              <tbody>
                {activeAlarms.slice(0, 20).map((a, i) => (
                  <tr key={`${a.deviceId}-${i}`}>
                    <td>{a.deviceName || `#${a.deviceId}`}</td>
                    <td>{a.alarmTitle}</td>
                    <td className="text-end">{a.valueData}</td>
                    <td><span className="badge bg-red text-red-fg">{t('iot.activeAlerts')}</span></td>
                  </tr>
                ))}
                {activeAlarms.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center text-secondary py-4">{t('iot.noSensorData')}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function StatCard({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="col-sm-6 col-lg-3">
      <div className="card">
        <div className="card-body">
          <div className="subheader">{label}</div>
          <div className="h1 mb-0" style={{ fontVariantNumeric: 'tabular-nums' }}>{value}</div>
          {hint && <div className="text-secondary small">{hint}</div>}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ device, t }: { device: DeviceGroup; t: (k: string) => string }) {
  if (device.status === 1) return <span className="badge bg-green text-green-fg">{t('iot.onlineStatus')}</span>;
  if (device.status === 0) return <span className="badge bg-red text-red-fg">{t('iot.offlineStatus')}</span>;
  return <span className="badge bg-secondary text-secondary-fg">{t('iot.maintenance')}</span>;
}

function Spinner({ label }: { label: string }) {
  return (
    <div className="text-center py-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">{label}</span>
      </div>
    </div>
  );
}
