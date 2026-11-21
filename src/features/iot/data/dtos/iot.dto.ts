/** FastAPI (fastapiiot) /iot/* response shapes — after envelope unwrap (`details.data`). */

export interface DeviceRowDto {
  device_id: number;
  device_name: string;
  type_name: string;
  value_data: string;
  unit: string;
  status: number;
  alarm_title: string;
  status_warning: string;
  status_alert: string;
  recovery_warning: string;
  recovery_alert: string;
  icon: string;
  color_normal?: string;
  color_warning?: string;
  color_alert?: string;
}

export interface DevicePageDto {
  data: DeviceRowDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPage: number;
}

export interface MonitorDeviceDto {
  device_id: number;
  device_name: string;
  hardware_id: number;
  type_id: number;
  type_name: string;
  location_name: string;
  unit: string;
  status: number;
  measurement: string;
  value_data: string;
  alarm_title: string;
  alarm_subject: string;
  alarm_status: number;
  mqtt_data_value: string;
  mqtt_data_control: string;
  mqtt_control_on: string;
  mqtt_control_off: string;
  devicedata: string;
  icon: string;
  timestamp: string;
}

export interface MonitorDeviceGroupDto {
  bucket: string;
  timestamp: string;
  device_count: number;
  layout: number;
  layout_name: string;
  data: { group_id: number; group_name: string; count: number; devices: MonitorDeviceDto[] }[];
}

export interface DeviceIoInfoDto {
  device_id: number;
  type_id: number;
  status: number;
  device_name: string;
  timestamp: string;
  subject: string;
  value_data: string;
  dataAlarm: number;
  eventControl?: number;
}

export interface AlarmDeviceStatusDto {
  statuscode: number;
  status: string;
  payload?: { deviceioinfo?: DeviceIoInfoDto[] };
}

export interface IoTStatusDto {
  mqtt_connected: boolean;
  cache_enabled: boolean;
}

export interface SensorChartDto {
  data?: number[];
  date?: string[];
  cache?: string;
}
