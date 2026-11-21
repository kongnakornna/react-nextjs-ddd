'use client';

import { useEffect, useMemo, useState } from 'react';

import { useI18n } from '@/src/core/services/i18n.service';
import { tf } from '@/src/core/ui/tf';
import { useAsync } from '@/src/core/ui/use-async';
import { iot } from '../iot.container';

interface IoTSetting {
  key: string;
  label: string;
  value: string;
  type: 'text' | 'number' | 'password' | 'toggle';
  group: string;
}

/** Defaults from the Angular page; overridden by the saved config of device "system". */
const DEFAULT_SETTINGS: IoTSetting[] = [
  { key: 'mqttBroker', label: 'MQTT Broker URL', value: 'mqtt://broker.example.com:1883', type: 'text', group: 'MQTT' },
  { key: 'mqttUsername', label: 'MQTT Username', value: '', type: 'text', group: 'MQTT' },
  { key: 'mqttPassword', label: 'MQTT Password', value: '', type: 'password', group: 'MQTT' },
  { key: 'mqttTopic', label: 'Default Topic', value: 'iot/devices/#', type: 'text', group: 'MQTT' },
  { key: 'influxHost', label: 'InfluxDB Host', value: 'http://localhost:8086', type: 'text', group: 'InfluxDB' },
  { key: 'influxOrg', label: 'Organization', value: 'myorg', type: 'text', group: 'InfluxDB' },
  { key: 'influxBucket', label: 'Default Bucket', value: 'iot_data', type: 'text', group: 'InfluxDB' },
  { key: 'influxToken', label: 'API Token', value: '', type: 'password', group: 'InfluxDB' },
  { key: 'dataRetentionDays', label: 'Data Retention (days)', value: '90', type: 'number', group: 'Data' },
  { key: 'autoCleanup', label: 'Auto Cleanup', value: 'true', type: 'toggle', group: 'Data' },
  { key: 'alertEnabled', label: 'Alert Notifications', value: 'true', type: 'toggle', group: 'Alerts' },
  { key: 'alertThreshold', label: 'Alert Threshold', value: '80', type: 'number', group: 'Alerts' },
];

const CONFIG_DEVICE = 'system';

/**
 * Port of icmonangular iot/presentation/pages/iot-settings.
 * Load: GET /iot/deviceconfig?deviceId=system · Save: PUT /iot/updatedeviceconfig?deviceId=system
 */
export default function IotSettingsPage() {
  const { t } = useI18n();
  const saved = useAsync(() => iot.getDeviceConfig.execute(CONFIG_DEVICE), []);
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(DEFAULT_SETTINGS.map((s) => [s.key, s.value])));
  const [baseline, setBaseline] = useState(values);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Merge saved config over defaults once it arrives.
  useEffect(() => {
    const cfg = saved.data?.config;
    if (!cfg) return;
    const merged = { ...baseline };
    for (const s of DEFAULT_SETTINGS) {
      if (cfg[s.key] !== undefined && cfg[s.key] !== null) merged[s.key] = String(cfg[s.key]);
    }
    setValues(merged);
    setBaseline(merged);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saved.data]);

  const groups = useMemo(() => Array.from(new Set(DEFAULT_SETTINGS.map((s) => s.group))), []);
  const dirty = DEFAULT_SETTINGS.some((s) => values[s.key] !== baseline[s.key]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await iot.updateDeviceConfig.execute(CONFIG_DEVICE, { ...(saved.data?.config ?? {}), ...values });
      setBaseline(values);
      setMessage({ type: 'success', text: tf(t, 'iot.settingsSaved', 'Settings saved successfully') });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const set = (key: string, v: string) => setValues((prev) => ({ ...prev, [key]: v }));

  return (
    <form onSubmit={save}>
      <div className="page-header d-print-none mb-3">
        <div className="row g-2 align-items-center">
          <div className="col">
            <div className="page-pretitle">{t('iot.subtitle')}</div>
            <h1 className="page-title">{t('iot.settings')}</h1>
          </div>
        </div>
      </div>

      {message && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'}`} role="status">{message.text}</div>
      )}
      {saved.error ? (
        <div className="alert alert-warning">
          {tf(t, 'iot.settingsLoadFailed', 'Could not load saved settings — showing defaults.')}{' '}
          <span className="text-secondary">{saved.error instanceof Error ? saved.error.message : ''}</span>
        </div>
      ) : null}

      {groups.map((group) => (
        <div className="card mb-3" key={group}>
          <div className="card-header"><h3 className="card-title">{group}</h3></div>
          <div className="card-body">
            <div className="row g-3">
              {DEFAULT_SETTINGS.filter((s) => s.group === group).map((s) => {
                const id = `iot-set-${s.key}`;
                return (
                  <div className="col-md-6" key={s.key}>
                    {s.type === 'toggle' ? (
                      <label className="form-check form-switch mt-md-4" htmlFor={id}>
                        <input id={id} className="form-check-input" type="checkbox" checked={values[s.key] === 'true'} onChange={(e) => set(s.key, e.target.checked ? 'true' : 'false')} />
                        <span className="form-check-label">{s.label}</span>
                      </label>
                    ) : (
                      <>
                        <label className="form-label" htmlFor={id}>{s.label}</label>
                        <input
                          id={id}
                          className="form-control"
                          type={s.type === 'number' ? 'number' : s.type === 'password' ? 'password' : 'text'}
                          autoComplete={s.type === 'password' ? 'new-password' : 'off'}
                          value={values[s.key] ?? ''}
                          onChange={(e) => set(s.key, e.target.value)}
                        />
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}

      <div className="d-flex gap-2">
        <button type="submit" className="btn btn-primary" disabled={saving || saved.loading}>
          {saving && <span className="spinner-border spinner-border-sm me-1" />}
          {t('iot.save')}
        </button>
        <button type="button" className="btn btn-outline-secondary" disabled={saving || !dirty} onClick={() => { setValues(baseline); setMessage(null); }}>
          {t('iot.reset')}
        </button>
      </div>
    </form>
  );
}
