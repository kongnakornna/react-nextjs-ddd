/** Port of icmonangular features/iot/domain/entities/device.entity.ts (+ FastAPI monitor group). */

export interface Device {
  id: string;
  name: string;
  deviceId: string;
  type: string;
  status: 'online' | 'offline' | 'maintenance';
  lastLocation?: GPSData;
  lastSeen?: Date;
  battery?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface GPSData {
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  accuracy?: number;
  timestamp: Date;
}

export interface SensorData {
  id: string;
  deviceId: string;
  temperature?: number;
  humidity?: number;
  pressure?: number;
  other: Record<string, number>;
  timestamp: Date;
}

export interface TopicData {
  topic: string;
  payload: string;
  from: string;
  timestamp: string;
  mqttConnected: boolean;
  cacheEnabled: boolean;
  cacheHit: boolean;
  dataLength: number;
  fetchDurationMs: number;
}

/** Row of GET /iot/device (paginated), /iot/devicebuckets, /iot/locationdevice */
export interface DeviceGroup {
  deviceId: number;
  deviceName: string;
  typeName: string;
  valueData: string;
  unit: string;
  /** 1 = online, 0 = offline */
  status: number;
  alarmTitle: string;
  statusWarning: string;
  statusAlert: string;
  recoveryWarning: string;
  recoveryAlert: string;
  icon: string;
  colorNormal?: string;
  colorWarning?: string;
  colorAlert?: string;
}

export interface DeviceBucket {
  bucket: string;
  devices: DeviceGroup[];
}

export interface SensorChartData {
  data: number[];
  date: string[];
  cache: string;
}

export interface DeviceStatusInfo {
  deviceId: string;
  isOnline: boolean;
  isActive: boolean;
  lastSeen: string;
  batteryLevel: number;
  signalStrength: number;
  firmwareVersion: string;
  location: { lat: number; lng: number };
  lastData: Record<string, unknown>;
  uptime: string;
}

export interface DeviceConfig {
  deviceId: string;
  config: Record<string, unknown>;
  status?: string;
}

export interface IoTDataRecord {
  id: number;
  deviceId: string;
  data: Record<string, unknown>;
  timestamp: string;
  location: unknown;
  metadata: unknown;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedIoTData {
  data: IoTDataRecord[];
  pagination: Pagination;
}

export interface DeviceStats {
  count: number;
  firstRecord?: string;
  lastRecord?: string;
  dataPoints?: Record<string, { min: number; max: number }>;
}

export interface AlarmDeviceStatus {
  deviceId: number;
  deviceName: string;
  typeId?: number;
  typeName: string;
  alarmTitle: string;
  /** 1 = alarm active */
  status: number;
  valueData?: string;
  timestamp?: string;
}

export interface IoTConnectionStatus {
  mqttConnected: boolean;
  cacheEnabled: boolean;
}

/** One device inside GET /iot/monitordevicegroup */
export interface MonitorDevice {
  deviceId: number;
  deviceName: string;
  hardwareId: number;
  typeId: number;
  typeName: string;
  locationName: string;
  unit: string;
  status: number;
  measurement: string;
  valueData: string;
  alarmTitle: string;
  alarmSubject: string;
  alarmStatus: number;
  mqttDataValue: string;
  mqttDataControl: string;
  mqttControlOn: string;
  mqttControlOff: string;
  deviceData: string;
  icon: string;
  timestamp: string;
}

export interface MonitorGroup {
  groupId: number;
  groupName: string;
  count: number;
  devices: MonitorDevice[];
}

export interface MonitorDeviceGroup {
  bucket: string;
  timestamp: string;
  deviceCount: number;
  layout: number;
  layoutName: string;
  groups: MonitorGroup[];
}

export interface DeviceListParams {
  page?: number;
  pageSize?: number;
  bucket?: string;
  hardwareId?: string;
  typeId?: string;
  keyword?: string;
  lang?: string;
}

export interface ChartParams {
  bucket: string;
  measurement: string;
  field?: string;
  start?: string;
  stop?: string;
  limit?: number;
}
