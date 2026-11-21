import type { AlarmLevel } from '@/src/features/smarthome/domain/entities/smarthome.entity';

/** One hardware group (Sensor, IO Sensor, IO Control, Critical Sensor). */
export interface IotGroupSummary {
  key: string;
  name: string;
  total: number;
  normal: number;
  warning: number;
  alarm: number;
}

/** A device that is currently in warning or alarm. */
export interface IotAlertDevice {
  id: number;
  name: string;
  group: string;
  display: string;
  level: AlarmLevel;
  title: string;
  timestamp: string;
}

/** IoT dashboard summary built from `/iot/monitordevicegroup`. */
export interface IotDashboardSummary {
  bucket: string;
  timestamp: string;
  totalDevices: number;
  normalDevices: number;
  warningDevices: number;
  alarmDevices: number;
  /** IO Control devices (hardware_id 3) and how many are ON. */
  controllable: number;
  controlsOn: number;
  groups: IotGroupSummary[];
  alerts: IotAlertDevice[];
}
