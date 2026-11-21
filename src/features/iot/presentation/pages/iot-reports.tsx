'use client';

import { useState } from 'react';

import { useI18n } from '@/src/core/services/i18n.service';
import { ApiErrorView } from '@/src/core/ui/api-unavailable';
import { tf } from '@/src/core/ui/tf';
import { useAsync } from '@/src/core/ui/use-async';
import { iot } from '../iot.container';

interface IoTReport {
  id: string;
  name: string;
  type: string;
  deviceId?: string;
  createdAt: string;
  status: 'ready' | 'generating' | 'failed';
}

const REPORT_TYPES = [
  { value: 'device-usage', label: 'Device Usage Report' },
  { value: 'sensor-data', label: 'Sensor Data Report' },
  { value: 'alarm-history', label: 'Alarm History Report' },
  { value: 'data-export', label: 'Raw Data Export' },
];

const today = () => new Date().toISOString().slice(0, 10);
const firstOfMonth = () => {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), 1).toISOString().slice(0, 10);
};

/**
 * Port of icmonangular iot/presentation/pages/iot-reports.
 * History rows are built from GET /iot/alarmdevicestatus (as in Angular);
 * Export → GET /iot/devicedataexport, Cleanup → DELETE /iot/devicedatacleanup.
 */
export default function IotReportsPage() {
  const { t } = useI18n();
  const [type, setType] = useState('device-usage');
  const [deviceId, setDeviceId] = useState('');
  const [startDate, setStartDate] = useState(firstOfMonth);
  const [endDate, setEndDate] = useState(today);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [generated, setGenerated] = useState<IoTReport[]>([]);
  const [cleanupDays, setCleanupDays] = useState(90);
  const [confirmCleanup, setConfirmCleanup] = useState(false);

  const history = useAsync(async () => {
    const alarms = await iot.getAlarmDeviceStatus.execute();
    const date = today();
    return alarms.slice(0, 50).map<IoTReport>((a, i) => ({
      id: `rpt-${i}`,
      name: `${a.deviceName || `Device ${a.deviceId}`} - ${a.alarmTitle || 'Report'}`,
      type: a.typeName || 'General',
      deviceId: String(a.deviceId),
      createdAt: date,
      status: 'ready',
    }));
  }, []);

  const reports = [...generated, ...(history.data ?? [])];

  const generate = async () => {
    setBusy(true);
    setMessage(null);
    try {
      await iot.getAlarmDeviceStatus.execute();
      const label = REPORT_TYPES.find((r) => r.value === type)?.label ?? 'Report';
      setGenerated((g) => [
        { id: `rpt-${Date.now()}`, name: `${label} - ${startDate} to ${endDate}`, type, deviceId: deviceId || undefined, createdAt: today(), status: 'ready' },
        ...g,
      ]);
      setMessage({ type: 'success', text: tf(t, 'iot.reportGenerated', 'Report generated successfully') });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to generate report' });
    } finally {
      setBusy(false);
    }
  };

  const exportData = async () => {
    if (!deviceId.trim()) {
      setMessage({ type: 'error', text: tf(t, 'iot.selectDeviceFirst', 'Please enter a device ID first') });
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const blob = await iot.exportDeviceData.execute(deviceId.trim(), startDate, endDate, 'csv');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `iot_data_${deviceId.trim()}_${startDate}_${endDate}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage({ type: 'success', text: tf(t, 'iot.exported', 'Data exported successfully') });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Export failed' });
    } finally {
      setBusy(false);
    }
  };

  const cleanup = async () => {
    setConfirmCleanup(false);
    if (!(cleanupDays > 0)) return;
    setBusy(true);
    setMessage(null);
    try {
      await iot.cleanupDeviceData.execute(cleanupDays);
      setMessage({ type: 'success', text: tf(t, 'iot.cleanedUp', `Data older than ${cleanupDays} days cleaned up`, { days: cleanupDays }) });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Cleanup failed' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="page-header d-print-none mb-3">
        <div className="row g-2 align-items-center">
          <div className="col">
            <div className="page-pretitle">{t('iot.subtitle')}</div>
            <h1 className="page-title">{t('iot.reports')}</h1>
          </div>
        </div>
      </div>

      {message && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`} role="status">
          {message.text}
        </div>
      )}

      <div className="row g-3">
        <div className="col-lg-4">
          <div className="card">
            <div className="card-header"><h3 className="card-title">{t('iot.generateReport')}</h3></div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label" htmlFor="rpt-type">{t('iot.reportType')}</label>
                <select id="rpt-type" className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
                  {REPORT_TYPES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="rpt-device">{t('iot.deviceId')}</label>
                <input id="rpt-device" className="form-control" value={deviceId} onChange={(e) => setDeviceId(e.target.value)} placeholder="e.g. 1" />
              </div>
              <div className="row g-2 mb-3">
                <div className="col">
                  <label className="form-label" htmlFor="rpt-start">{t('iot.startDate')}</label>
                  <input id="rpt-start" type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="col">
                  <label className="form-label" htmlFor="rpt-end">{t('iot.endDate')}</label>
                  <input id="rpt-end" type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </div>
              <div className="d-flex gap-2 flex-wrap">
                <button type="button" className="btn btn-primary" onClick={generate} disabled={busy}>
                  {busy && <span className="spinner-border spinner-border-sm me-1" />}
                  {t('iot.generate')}
                </button>
                <button type="button" className="btn btn-outline-secondary" onClick={exportData} disabled={busy}>{t('iot.export')}</button>
              </div>
              <hr />
              {confirmCleanup ? (
                <div className="d-flex gap-2 align-items-end flex-wrap">
                  <div>
                    <label className="form-label" htmlFor="rpt-days">{tf(t, 'iot.cleanupDays', 'Delete data older than (days)')}</label>
                    <input id="rpt-days" type="number" min={1} className="form-control" style={{ width: '8rem' }} value={cleanupDays} onChange={(e) => setCleanupDays(Number(e.target.value))} />
                  </div>
                  <button type="button" className="btn btn-danger btn-sm" onClick={cleanup} disabled={busy}>{t('iot.cleanup')}</button>
                  <button type="button" className="btn btn-sm" onClick={() => setConfirmCleanup(false)}>{tf(t, 'common.cancel', 'Cancel')}</button>
                </div>
              ) : (
                <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => setConfirmCleanup(true)} disabled={busy}>{t('iot.cleanup')}</button>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card">
            <div className="card-header"><h3 className="card-title">{t('iot.reportHistory')}</h3></div>
            {history.error ? (
              <div className="card-body"><ApiErrorView error={history.error} /></div>
            ) : (
              <div className="table-responsive">
                <table className="table table-vcenter card-table">
                  <thead>
                    <tr>
                      <th>{t('iot.name')}</th>
                      <th>{t('iot.type')}</th>
                      <th>{t('iot.date')}</th>
                      <th>{t('iot.status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((r) => (
                      <tr key={r.id}>
                        <td>{r.name}</td>
                        <td>{r.type}</td>
                        <td className="text-nowrap">{r.createdAt}</td>
                        <td>
                          <span className={`badge ${r.status === 'ready' ? 'bg-green text-green-fg' : r.status === 'generating' ? 'bg-yellow text-yellow-fg' : 'bg-red text-red-fg'}`}>{r.status}</span>
                        </td>
                      </tr>
                    ))}
                    {!history.loading && reports.length === 0 && (
                      <tr><td colSpan={4} className="text-center text-secondary py-4">{t('iot.noReports')}</td></tr>
                    )}
                    {history.loading && reports.length === 0 && (
                      <tr><td colSpan={4} className="text-center text-secondary py-4">{t('iot.loading')}</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
