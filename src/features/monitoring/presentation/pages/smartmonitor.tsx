'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';

import { useI18n } from '@/src/core/services/i18n.service';
import { ApiErrorView } from '@/src/core/ui/api-unavailable';
import { tf } from '@/src/core/ui/tf';
import { useAsync } from '@/src/core/ui/use-async';
import { iot, type MonitorDevice, type MonitorGroup } from '@/src/features/iot';

const ROWS_PER_GROUP = 8;

/**
 * Port of icmonangular monitoring/smartmonitor-dashboard.
 * Angular used placeholder stats (all 0) and Tabler demo panels (revenue,
 * storage, visited pages). Here every number comes from FastAPI:
 *   GET /iot/monitordevicegroup  → devices per group, online rate
 *   GET /iot/status              → MQTT connection / cache
 *   GET /iot/alarmdevicestatus   → active alarms
 */
export default function SmartMonitorPage() {
  const { t, lang } = useI18n();
  const groups = useAsync(() => iot.getMonitorDeviceGroup.execute({ lang }), [lang]);
  const status = useAsync(() => iot.getStatus.execute(), []);
  const alarms = useAsync(() => iot.getAlarmDeviceStatus.execute(), []);

  const stats = useMemo(() => {
    const unique = new Map<number, MonitorDevice>();
    for (const g of groups.data?.groups ?? []) for (const d of g.devices) unique.set(d.deviceId, d);
    const all = Array.from(unique.values());
    const online = all.filter((d) => d.status === 1).length;
    return { total: all.length, online, rate: all.length ? Math.round((online / all.length) * 100) : 0 };
  }, [groups.data]);

  const activeAlarms = (alarms.data ?? []).filter((a) => a.status === 1);

  const refresh = () => {
    void groups.reload();
    void status.reload();
    void alarms.reload();
  };

  return (
    <>
      <div className="page-header d-print-none mb-3">
        <div className="row g-2 align-items-center">
          <div className="col">
            <div className="page-pretitle">{t('monitoring.title')}</div>
            <h1 className="page-title">{tf(t, 'monitoring.modules.smartmonitor', 'SmartMonitor')}</h1>
            {groups.data?.timestamp && (
              <div className="text-secondary mt-1 small">
                {tf(t, 'iot.lastUpdated', 'Last updated')}: {new Date(groups.data.timestamp).toLocaleString()}
              </div>
            )}
          </div>
          <div className="col-auto ms-auto">
            <button type="button" className="btn" onClick={refresh} disabled={groups.loading}>
              {groups.loading ? <span className="spinner-border spinner-border-sm me-2" /> : <RefreshCw className="icon" />}
              {tf(t, 'common.refresh', 'Refresh')}
            </button>
          </div>
        </div>
      </div>

      {groups.error ? (
        <ApiErrorView error={groups.error} />
      ) : (
        <>
          <div className="row row-deck row-cards mb-3">
            <div className="col-sm-12 col-lg-6">
              <div className="card">
                <div className="card-body">
                  <h3 className="h2">{tf(t, 'dashboard.welcome', 'Welcome')}</h3>
                  <p className="text-secondary">{tf(t, 'dashboard.welcomeMessage', '')}</p>
                  <div className="row g-5">
                    <div className="col-auto" style={{ minWidth: '10rem' }}>
                      <div className="subheader">{tf(t, 'dashboard.onlineRate', 'Online rate')}</div>
                      <div className="h3" style={{ fontVariantNumeric: 'tabular-nums' }}>{groups.loading ? '…' : `${stats.rate}%`}</div>
                      <div className="progress progress-sm">
                        <div
                          className="progress-bar bg-success"
                          style={{ width: `${stats.rate}%` }}
                          role="progressbar"
                          aria-valuenow={stats.rate}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={tf(t, 'dashboard.onlineRate', 'Online rate')}
                        />
                      </div>
                    </div>
                    <div className="col-auto">
                      <div className="subheader">{tf(t, 'dashboard.onlineDevices', 'Online devices')}</div>
                      <div className="d-flex align-items-baseline">
                        <div className="h3 me-2" style={{ fontVariantNumeric: 'tabular-nums' }}>{stats.online.toLocaleString()}</div>
                        <div className="text-secondary small">{tf(t, 'dashboard.ofTotal', 'of')} {stats.total.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Stat label={tf(t, 'dashboard.totalDevices', 'Total devices')} value={groups.loading ? '…' : stats.total.toLocaleString()} sub={`${groups.data?.groups.length ?? 0} groups · ${groups.data?.layoutName ?? ''}`} />

            <div className="col-sm-6 col-lg-3">
              <div className="card">
                <div className="card-body">
                  <div className="subheader">MQTT</div>
                  {status.error ? (
                    <div className="text-secondary small">{status.error instanceof Error ? status.error.message : '—'}</div>
                  ) : (
                    <>
                      <div className="h1 mb-2 d-flex align-items-center gap-2">
                        <span className={`status-dot ${status.data?.mqttConnected ? 'status-dot-animated status-green' : 'status-red'}`} />
                        {status.loading ? '…' : status.data?.mqttConnected ? tf(t, 'common.connected', 'Connected') : tf(t, 'common.disconnected', 'Disconnected')}
                      </div>
                      <div className="text-secondary small">Cache: {status.data?.cacheEnabled ? 'on' : 'off'}</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="row row-cards">
            <div className="col-lg-8">
              {(groups.data?.groups ?? []).map((g) => (
                <GroupCard key={g.groupId} group={g} t={t} />
              ))}
              {groups.loading && !groups.data && (
                <div className="card"><div className="card-body text-center py-5"><div className="spinner-border text-primary" role="status" /></div></div>
              )}
            </div>

            <div className="col-lg-4">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">{tf(t, 'dashboard.activeAlerts', 'Active alerts')}</h3>
                  <div className="card-actions"><span className="badge bg-red text-red-fg">{activeAlarms.length}</span></div>
                </div>
                {alarms.error ? (
                  <div className="card-body"><ApiErrorView error={alarms.error} /></div>
                ) : (
                  <div className="list-group list-group-flush" style={{ maxHeight: '32rem', overflowY: 'auto' }}>
                    {activeAlarms.slice(0, 30).map((a, i) => (
                      <div className="list-group-item" key={`${a.deviceId}-${i}`}>
                        <div className="row align-items-center g-2">
                          <div className="col-auto"><span className="status-dot status-dot-animated bg-red d-block" /></div>
                          <div className="col text-truncate">
                            <Link href={`/iot/devices/${a.deviceId}`} className="text-body d-block text-truncate">{a.deviceName || `#${a.deviceId}`}</Link>
                            <div className="text-secondary small text-truncate">{a.alarmTitle} · {a.valueData}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {!alarms.loading && activeAlarms.length === 0 && (
                      <div className="list-group-item text-secondary text-center">{tf(t, 'dashboard.noData', 'No data')}</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="col-sm-6 col-lg-3">
      <div className="card">
        <div className="card-body">
          <div className="subheader">{label}</div>
          <div className="h1 mb-2" style={{ fontVariantNumeric: 'tabular-nums' }}>{value}</div>
          {sub && <div className="text-secondary small">{sub}</div>}
        </div>
      </div>
    </div>
  );
}

function GroupCard({ group, t }: { group: MonitorGroup; t: (k: string) => string }) {
  const [showAll, setShowAll] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const rows = showAll ? group.devices : group.devices.slice(0, ROWS_PER_GROUP);
  const online = group.devices.filter((d) => d.status === 1).length;

  const control = async (d: MonitorDevice, on: boolean) => {
    const key = `${d.deviceId}-${on}`;
    setBusy(key);
    setMessage(null);
    try {
      await iot.postControl.execute({ topic: d.mqttDataControl, message: on ? d.mqttControlOn : d.mqttControlOff });
      setMessage(`${d.deviceName}: ${on ? 'ON' : 'OFF'} → ${d.mqttDataControl}`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="card mb-3">
      <div className="card-header">
        <h3 className="card-title">{group.groupName}</h3>
        <div className="card-actions text-secondary small" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {online}/{group.count} {tf(t, 'iot.onlineStatus', 'online')}
        </div>
      </div>
      {message && <div className="alert alert-info m-3 mb-0 py-2">{message}</div>}
      <div className="table-responsive">
        <table className="table table-vcenter card-table">
          <thead>
            <tr>
              <th>{tf(t, 'iot.deviceName', 'Device')}</th>
              <th>{tf(t, 'iot.location', 'Location')}</th>
              <th className="text-end">{tf(t, 'iot.value', 'Value')}</th>
              <th>{tf(t, 'iot.status', 'Status')}</th>
              <th className="w-1" />
            </tr>
          </thead>
          <tbody>
            {rows.map((d, i) => (
              <tr key={`${d.deviceId}-${i}`}>
                <td>
                  <Link href={`/iot/devices/${d.deviceId}`}>{d.deviceName || `#${d.deviceId}`}</Link>
                  <div className="text-secondary small">{d.typeName} · {d.measurement}</div>
                </td>
                <td className="text-secondary">{d.locationName}</td>
                <td className="text-end text-nowrap" style={{ fontVariantNumeric: 'tabular-nums' }}>{d.valueData} {d.unit}</td>
                <td>
                  <span className={`badge ${d.alarmStatus ? 'bg-orange text-orange-fg' : d.status === 1 ? 'bg-green text-green-fg' : 'bg-secondary text-secondary-fg'}`}>
                    {d.alarmStatus ? d.alarmTitle : d.status === 1 ? tf(t, 'iot.onlineStatus', 'Online') : tf(t, 'iot.offlineStatus', 'Offline')}
                  </span>
                </td>
                <td className="text-nowrap">
                  {d.mqttDataControl && (
                    <div className="btn-group btn-group-sm" role="group" aria-label={`Control ${d.deviceName}`}>
                      <button type="button" className="btn" disabled={busy !== null} onClick={() => control(d, true)}>ON</button>
                      <button type="button" className="btn" disabled={busy !== null} onClick={() => control(d, false)}>OFF</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {group.devices.length > ROWS_PER_GROUP && (
        <div className="card-footer text-center">
          <button type="button" className="btn btn-link btn-sm" onClick={() => setShowAll((v) => !v)}>
            {showAll ? tf(t, 'common.showLess', 'Show less') : `${tf(t, 'common.showAll', 'Show all')} (${group.devices.length})`}
          </button>
        </div>
      )}
    </div>
  );
}
