import type { DeviceGroupSnapshot } from '@/src/features/smarthome/domain/entities/smarthome.entity';
import {
  isControllable,
  isOn,
} from '@/src/features/smarthome/domain/entities/smarthome.entity';
import type {
  IotAlertDevice,
  IotDashboardSummary,
} from '../entities/iot-dashboard.entity';

const isWarning = (l: string) => l === 'warning';
const isAlarm = (l: string) => l === 'alarm';

/** Device groups → dashboard numbers. Alarms are listed first, then warnings. */
export function summarize(s: DeviceGroupSnapshot): IotDashboardSummary {
  const devices = s.groups.flatMap((g) => g.devices.map((d) => ({ g, d })));
  const alerts: IotAlertDevice[] = devices
    .filter(({ d }) => isWarning(d.alarmLevel) || isAlarm(d.alarmLevel))
    .sort(
      (a, b) =>
        Number(isAlarm(b.d.alarmLevel)) - Number(isAlarm(a.d.alarmLevel))
    )
    .map(({ g, d }) => ({
      id: d.id,
      name: d.name,
      group: g.name,
      display: d.display,
      level: d.alarmLevel,
      title: d.alarmTitle,
      timestamp: d.timestamp,
    }));

  const warning = devices.filter(({ d }) => isWarning(d.alarmLevel)).length;
  const alarm = devices.filter(({ d }) => isAlarm(d.alarmLevel)).length;
  const controls = devices.filter(({ d }) => isControllable(d));

  return {
    bucket: s.bucket,
    timestamp: s.timestamp,
    totalDevices: devices.length,
    normalDevices: devices.length - warning - alarm,
    warningDevices: warning,
    alarmDevices: alarm,
    controllable: controls.length,
    controlsOn: controls.filter(({ d }) => isOn(d)).length,
    groups: s.groups.map((g) => {
      const w = g.devices.filter((d) => isWarning(d.alarmLevel)).length;
      const a = g.devices.filter((d) => isAlarm(d.alarmLevel)).length;
      return {
        key: g.key,
        name: g.name,
        total: g.devices.length,
        normal: g.devices.length - w - a,
        warning: w,
        alarm: a,
      };
    }),
    alerts,
  };
}

/** % of devices that are normal (0 when there are no devices). */
export function healthyRate(
  s: Pick<IotDashboardSummary, 'totalDevices' | 'normalDevices'>
): number {
  if (!s.totalDevices) return 0;
  return Math.round((s.normalDevices / s.totalDevices) * 100);
}

export function percent(part: number, total: number): number {
  return total ? Math.round((part / total) * 100) : 0;
}
