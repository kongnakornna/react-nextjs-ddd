/**
 * Smarthome domain entities.
 * Port of webiot (CodeIgniter) `modules/smarthome` → dashboardsetting/dashboardcontainer.php.
 */

/** Alarm level from the backend `alarm_status` (1 warning · 2 alarm · 3/4/5 normal variants). */
export type AlarmLevel = 'warning' | 'alarm' | 'minor' | 'info' | 'normal';

/** Hardware groups returned by `/iot/monitordevicegroup` (`group_id` = hardware_id). */
export const HARDWARE = {
  SENSOR: 1,
  IO_SENSOR: 2,
  IO_CONTROL: 3,
  CRITICAL_SENSOR: 4,
} as const;

export interface SmartDevice {
  id: number;
  name: string;
  hardwareId: number;
  typeName: string;
  unit: string;
  /** Raw value (e.g. "25.30", "1"). */
  value: string;
  /** Display value (e.g. "25.30 °C", "ON"). */
  display: string;
  alarmLevel: AlarmLevel;
  alarmTitle: string;
  measurement: string;
  /** MQTT topic to send ON/OFF to (empty → not controllable). */
  controlTopic: string;
  controlOn: string;
  controlOff: string;
  timestamp: string;
  colors: { normal?: string; warning?: string; alert?: string };
}

export interface DeviceGroup {
  /** Stable DOM / config key: `group1`, `group2`… (same as the PHP view). */
  key: string;
  groupId: number;
  name: string;
  devices: SmartDevice[];
  /** Worst level of the devices in the group. */
  level: AlarmLevel;
}

export interface DeviceGroupSnapshot {
  bucket: string;
  timestamp: string;
  deviceCount: number;
  groups: DeviceGroup[];
}

export interface Point {
  top: number;
  left: number;
}

/** Position of one HUD card and the room point its leader line goes to. */
export interface GroupPosition {
  groupKey: string;
  card: Point;
  target: Point;
}

/**
 * Dashboard layout saved per location — same shape as the PHP
 * `settings/dashboardconfig` payload (`config.groups[].card_pos/target_pos`).
 */
export interface DashboardLayoutConfig {
  locationId: number;
  name: string;
  doorOpened: boolean;
  cardOpacity: number; // 10–100 %
  screenBrightness: number; // 20–350 %
  groups: GroupPosition[];
  updatedAt: string;
}

export interface ControlCommand {
  topic: string;
  message: string;
}

export function isControllable(d: SmartDevice): boolean {
  return (
    d.hardwareId === HARDWARE.IO_CONTROL &&
    !!d.controlTopic &&
    !!d.controlOn &&
    !!d.controlOff
  );
}

export function isOn(d: SmartDevice): boolean {
  return d.display.toUpperCase() === 'ON';
}
