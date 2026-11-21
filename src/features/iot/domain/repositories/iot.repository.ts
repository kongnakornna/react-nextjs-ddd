import type {
  AlarmDeviceStatus, ChartParams, Device, DeviceBucket, DeviceConfig, DeviceGroup, DeviceListParams,
  DeviceStats, DeviceStatusInfo, GPSData, IoTConnectionStatus, MonitorDeviceGroup, PaginatedIoTData,
  SensorChartData, SensorData, TopicData,
} from '../entities/device.entity';

/** Port of icmonangular IIoTRepository (Observable → Promise). */
export interface IIoTRepository {
  // Not on FastAPI yet → throw ApiNotAvailableError
  listDevices(): Promise<Device[]>;
  registerDevice(device: Partial<Device>): Promise<Device>;
  getDeviceLocation(id: string): Promise<GPSData>;
  getDeviceHistory(id: string, startDate: Date, endDate: Date): Promise<GPSData[]>;
  getSensorData(id: string): Promise<SensorData[]>;

  // FastAPI /iot/*
  getStatus(): Promise<IoTConnectionStatus>;
  getTopicData(topic: string, delcache?: string): Promise<TopicData>;
  getTopicDeviceChart(params: { topic: string; bucket?: string; measurement?: string; field?: string; start?: string; stop?: string; limit?: number; delcache?: string }): Promise<unknown>;
  getControls(topic: string, message: string): Promise<unknown>;
  postControl(data: { topic: string; message: string }): Promise<unknown>;
  getMonitorDeviceGroup(params?: { bucket?: string; locationId?: string; hardwareId?: string; lang?: string }): Promise<MonitorDeviceGroup>;
  getMonitorDeviceChart(params: Partial<ChartParams> & { bucket: string }): Promise<SensorChartData>;
  getDeviceBuckets(bucket: string): Promise<DeviceBucket>;
  listDevicesPaginated(params: DeviceListParams): Promise<{ data: DeviceGroup[]; total: number; page: number; totalPage: number }>;
  getSenserCharts(params: ChartParams): Promise<SensorChartData>;
  getDeviceSenserCharts(params: ChartParams): Promise<SensorChartData>;
  getLocationDevice(locationId: number): Promise<DeviceGroup[]>;
  getAlarmDeviceStatus(): Promise<AlarmDeviceStatus[]>;
  getAlarmDeviceStatusControl(): Promise<AlarmDeviceStatus[]>;
  getDeviceStatus(deviceId: string): Promise<DeviceStatusInfo>;
  updateDeviceStatus(deviceId: string, data: Record<string, unknown>): Promise<unknown>;
  getDeviceConfig(deviceId: string): Promise<DeviceConfig>;
  updateDeviceConfig(deviceId: string, config: Record<string, unknown>): Promise<unknown>;
  getDeviceIoTData(deviceId: string, params: { page?: number; limit?: number; startDate?: string; endDate?: string }): Promise<PaginatedIoTData>;
  getDeviceStats(deviceId: string): Promise<DeviceStats>;
  exportDeviceData(deviceId: string, startDate: string, endDate: string, format?: string): Promise<Blob>;
  cleanupDeviceData(days?: number): Promise<void>;
}
