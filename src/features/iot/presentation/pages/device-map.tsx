'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { useI18n } from '@/src/core/services/i18n.service';
import { ApiErrorView } from '@/src/core/ui/api-unavailable';
import { tf } from '@/src/core/ui/tf';
import { useAsync } from '@/src/core/ui/use-async';
import type { MonitorDevice } from '../../domain/entities/device.entity';
import { iot } from '../iot.container';

/**
 * Port of icmonangular iot/presentation/pages/device-map.
 * Angular had a map placeholder + sample list; here devices come from
 * GET /iot/monitordevicegroup and are grouped by location. FastAPI gives
 * no per-device coordinates in this list (only /iot/devicestatus has lat/lng),
 * so the map area stays a placeholder like in Angular.
 */
export default function DeviceMapPage() {
  const { t } = useI18n();
  const groups = useAsync(() => iot.getMonitorDeviceGroup.execute(), []);
  const [selected, setSelected] = useState<string | null>(null);

  const byLocation = useMemo(() => {
    const map = new Map<string, MonitorDevice[]>();
    for (const g of groups.data?.groups ?? []) {
      for (const d of g.devices) {
        const key = d.locationName || '—';
        if (!map.has(key)) map.set(key, []);
        // de-duplicate the same device listed in several groups
        if (!map.get(key)!.some((x) => x.deviceId === d.deviceId)) map.get(key)!.push(d);
      }
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [groups.data]);

  const visible = selected ? byLocation.filter(([loc]) => loc === selected) : byLocation;
  const deviceCount = byLocation.reduce((n, [, list]) => n + list.length, 0);

  return (
    <>
      <div className="page-header d-print-none mb-3">
        <div className="row g-2 align-items-center">
          <div className="col">
            <h1 className="page-title">{t('iot.mapTitle')}</h1>
            <div className="text-secondary mt-1">{t('iot.mapSubtitle')}</div>
          </div>
        </div>
      </div>

      {groups.error ? (
        <ApiErrorView error={groups.error} />
      ) : (
        <div className="row g-3">
          <div className="col-lg-4">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">{t('iot.location')} ({byLocation.length})</h3>
              </div>
              <div className="list-group list-group-flush">
                <button
                  type="button"
                  className={`list-group-item list-group-item-action d-flex justify-content-between${selected === null ? ' active' : ''}`}
                  onClick={() => setSelected(null)}
                >
                  <span>{tf(t, 'common.all', 'All')}</span>
                  <span className="badge bg-secondary-lt">{deviceCount}</span>
                </button>
                {byLocation.map(([loc, list]) => (
                  <button
                    key={loc}
                    type="button"
                    className={`list-group-item list-group-item-action d-flex justify-content-between${selected === loc ? ' active' : ''}`}
                    onClick={() => setSelected(loc)}
                  >
                    <span className="text-truncate">{loc}</span>
                    <span className="badge bg-secondary-lt">{list.length}</span>
                  </button>
                ))}
                {groups.loading && <div className="list-group-item text-secondary">{t('iot.loading')}</div>}
              </div>
            </div>
          </div>

          <div className="col-lg-8">
            {visible.map(([loc, list]) => (
              <div className="card mb-3" key={loc}>
                <div className="card-header">
                  <h3 className="card-title">{loc}</h3>
                  <div className="card-actions text-secondary small">{list.length} {t('iot.items')}</div>
                </div>
                <div className="list-group list-group-flush">
                  {list.map((d) => (
                    <div className="list-group-item" key={d.deviceId}>
                      <div className="row align-items-center g-2">
                        <div className="col-auto">
                          <span className={`avatar ${d.status === 1 ? 'bg-green-lt' : 'bg-red-lt'}`}>
                            {(d.deviceName || '?').charAt(0)}
                          </span>
                        </div>
                        <div className="col text-truncate">
                          <Link href={`/iot/devices/${d.deviceId}`} className="text-reset d-block">{d.deviceName}</Link>
                          <div className="text-secondary text-truncate small">{d.typeName} · {d.measurement}</div>
                        </div>
                        <div className="col-auto text-end">
                          <div style={{ fontVariantNumeric: 'tabular-nums' }}>{d.valueData} {d.unit}</div>
                          <span className={`badge ${d.status === 1 ? 'bg-green text-green-fg' : 'bg-red text-red-fg'}`}>
                            {d.status === 1 ? t('iot.onlineStatus') : t('iot.offlineStatus')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {!groups.loading && visible.length === 0 && (
              <div className="card"><div className="card-body text-center text-secondary">{t('iot.noSensorData')}</div></div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
