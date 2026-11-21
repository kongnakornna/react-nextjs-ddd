'use client';

import Link from 'next/link';

import { useI18n } from '@/src/core/services/i18n.service';
import { ApiErrorView } from '@/src/core/ui/api-unavailable';
import { tf } from '@/src/core/ui/tf';
import { useAsync } from '@/src/core/ui/use-async';
import { MonitoringApiDataSource } from '../../data/datasources/monitoring.api.datasource';
import { MonitoringRepositoryImpl } from '../../data/repositories/monitoring.repository.impl';
import { DASHBOARD_MODULES, type DashboardModule } from '../../domain/entities/monitoring-device.entity';
import { ListMonitoringDevicesUseCase } from '../../domain/use-cases/list-monitoring-devices.use-case';

const listDevices = new ListMonitoringDevicesUseCase(new MonitoringRepositoryImpl(new MonitoringApiDataSource()));

/**
 * Module dashboards (smarthome, smartcity, industry, smartsolarfarm).
 * Angular shows "Coming soon" for these; the device list endpoint
 * `/monitoring/{module}/devices` is not on FastAPI yet.
 */
export default function MonitoringDashboardPage({ module }: { module: DashboardModule }) {
  const { t } = useI18n();
  const info = DASHBOARD_MODULES.find((m) => m.key === module);
  const devices = useAsync(() => listDevices.execute(module), [module]);

  return (
    <>
      <div className="page-header d-print-none mb-3">
        <div className="row g-2 align-items-center">
          <div className="col">
            <div className="page-pretitle">{t('monitoring.title')}</div>
            <h1 className="page-title">{tf(t, `monitoring.modules.${module}`, info?.label ?? module)}</h1>
            {info?.description && <div className="text-secondary mt-1">{info.description}</div>}
          </div>
        </div>
      </div>

      {devices.error ? (
        <div className="card">
          <div className="card-body">
            <ApiErrorView error={devices.error} />
          </div>
        </div>
      ) : devices.loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary" role="status" /></div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="table table-vcenter card-table">
              <thead>
                <tr><th>{t('iot.deviceName')}</th><th>{t('iot.location')}</th><th>{t('iot.status')}</th></tr>
              </thead>
              <tbody>
                {(devices.data ?? []).map((d) => (
                  <tr key={d.id}>
                    <td>{d.name}</td>
                    <td className="text-secondary">{d.location}</td>
                    <td>
                      <span className={`badge ${d.status ? 'bg-green text-green-fg' : 'bg-red text-red-fg'}`}>
                        {d.status ? t('iot.onlineStatus') : t('iot.offlineStatus')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card mt-3">
        <div className="card-body text-center py-4">
          <h3>{tf(t, `monitoring.modules.${module}`, info?.label ?? module)} Dashboard</h3>
          <p className="text-secondary">{tf(t, 'monitoring.comingSoon', 'Coming soon...')}</p>
          <Link href="/monitoring/smartmonitor" className="btn btn-outline-primary">
            {tf(t, 'monitoring.modules.smartmonitor', 'SmartMonitor')} →
          </Link>
        </div>
      </div>
    </>
  );
}
