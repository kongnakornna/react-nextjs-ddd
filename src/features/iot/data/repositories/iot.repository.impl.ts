import type {
  AlarmDeviceStatus, ChartParams, Device, DeviceBucket, DeviceConfig, DeviceGroup, DeviceListParams,
  DeviceStats, DeviceStatusInfo, GPSData, IoTConnectionStatus, IoTDataRecord, MonitorDevice,
  MonitorDeviceGroup, PaginatedIoTData, SensorChartData, SensorData, TopicData,
} from '../../domain/entities/device.entity';
import type { IIoTRepository } from '../../domain/repositories/iot.repository';
import type { DeviceIoInfoDto, DeviceRowDto, MonitorDeviceDto, SensorChartDto } from '../dtos/iot.dto';
import { IoTApiDataSource } from '../datasources/iot.api.datasource';

/** Port of icmonangular IoTRepositoryImpl — maps FastAPI snake_case → entities. */
export class IoTRepositoryImpl implements IIoTRepository {
  constructor(private ds: IoTApiDataSource = new IoTApiDataSource()) {}

  async listDevices(): Promise<Device[]> {
    return (await this.ds.listDevices()) as Device[];
  }
  async registerDevice(device: Partial<Device>): Promise<Device> {
    return (await this.ds.registerDevice(device)) as Device;
  }
  async getDeviceLocation(id: string): Promise<GPSData> {
    return (await this.ds.getDeviceLocation(id)) as GPSData;
  }
  async getDeviceHistory(id: string, startDate: Date, endDate: Date): Promise<GPSData[]> {
    return (await this.ds.getDeviceHistory(id, startDate, endDate)) as GPSData[];
  }
  async getSensorData(id: string): Promise<SensorData[]> {
    return (await this.ds.getSensorData(id)) as SensorData[];
  }

  async getStatus(): Promise<IoTConnectionStatus> {
    const s = await this.ds.getStatus();
    return { mqttConnected: !!s?.mqtt_connected, cacheEnabled: !!s?.cache_enabled };
  }

  async getTopicData(topic: string, delcache?: string): Promise<TopicData> {
    const d = (await this.ds.getTopicData(topic, delcache)) ?? {};
    const pick = (camel: string, snake: string) => (d as Record<string, unknown>)[camel] ?? (d as Record<string, unknown>)[snake];
    return {
      topic: String(pick('topic', 'topic') ?? topic),
      payload: String(pick('payload', 'payload') ?? ''),
      from: String(pick('from', 'from') ?? ''),
      timestamp: String(pick('timestamp', 'timestamp') ?? ''),
      mqttConnected: Boolean(pick('mqttConnected', 'mqtt_connected')),
      cacheEnabled: Boolean(pick('cacheEnabled', 'cache_enabled')),
      cacheHit: Boolean(pick('cacheHit', 'cache_hit')),
      dataLength: Number(pick('dataLength', 'data_length') ?? 0),
      fetchDurationMs: Number(pick('fetchDurationMs', 'fetch_duration_ms') ?? 0),
    };
  }

  getTopicDeviceChart(params: Parameters<IIoTRepository['getTopicDeviceChart']>[0]) {
    return this.ds.getTopicDeviceChart(params);
  }
  getControls(topic: string, message: string) {
    return this.ds.getControls(topic, message);
  }
  postControl(data: { topic: string; message: string }) {
    return this.ds.postControl(data);
  }

  async getMonitorDeviceGroup(params?: Parameters<IIoTRepository['getMonitorDeviceGroup']>[0]): Promise<MonitorDeviceGroup> {
    const d = await this.ds.getMonitorDeviceGroup(params);
    return {
      bucket: d?.bucket ?? '',
      timestamp: d?.timestamp ?? '',
      deviceCount: d?.device_count ?? 0,
      layout: d?.layout ?? 0,
      layoutName: d?.layout_name ?? '',
      groups: (d?.data ?? []).map((g) => ({
        groupId: g.group_id,
        groupName: g.group_name,
        count: g.count,
        devices: (g.devices ?? []).map(toMonitorDevice),
      })),
    };
  }

  async getMonitorDeviceChart(params: Partial<ChartParams> & { bucket: string }): Promise<SensorChartData> {
    return toChart(await this.ds.getMonitorDeviceChart(params));
  }

  async getDeviceBuckets(bucket: string): Promise<DeviceBucket> {
    const d = await this.ds.getDeviceBuckets(bucket);
    return { bucket: d?.bucket ?? bucket, devices: (d?.devices ?? []).map(toDeviceGroup) };
  }

  async listDevicesPaginated(params: DeviceListParams) {
    const res = await this.ds.listDevicesPaginated(params);
    return {
      data: (res?.data ?? []).map(toDeviceGroup),
      total: res?.total ?? 0,
      page: res?.page ?? params.page ?? 1,
      totalPage: res?.totalPage ?? 1,
    };
  }

  async getSenserCharts(params: ChartParams): Promise<SensorChartData> {
    return toChart(await this.ds.getSenserCharts(params));
  }
  async getDeviceSenserCharts(params: ChartParams): Promise<SensorChartData> {
    return toChart(await this.ds.getDeviceSenserCharts(params));
  }

  async getLocationDevice(locationId: number): Promise<DeviceGroup[]> {
    const list = await this.ds.getLocationDevice(locationId);
    return (Array.isArray(list) ? list : []).map(toDeviceGroup);
  }

  async getAlarmDeviceStatus(): Promise<AlarmDeviceStatus[]> {
    const d = await this.ds.getAlarmDeviceStatus();
    return (d?.payload?.deviceioinfo ?? []).map(toAlarm);
  }
  async getAlarmDeviceStatusControl(): Promise<AlarmDeviceStatus[]> {
    const d = await this.ds.getAlarmDeviceStatusControl();
    return (d?.payload?.deviceioinfo ?? []).map(toAlarm);
  }

  async getDeviceStatus(deviceId: string): Promise<DeviceStatusInfo> {
    return (await this.ds.getDeviceStatus(deviceId)) as unknown as DeviceStatusInfo;
  }
  updateDeviceStatus(deviceId: string, data: Record<string, unknown>) {
    return this.ds.updateDeviceStatus(deviceId, data);
  }

  async getDeviceConfig(deviceId: string): Promise<DeviceConfig> {
    const d = (await this.ds.getDeviceConfig(deviceId)) ?? {};
    return {
      deviceId: String(d.deviceId ?? deviceId),
      config: (d.config as Record<string, unknown>) ?? {},
      status: d.status as string | undefined,
    };
  }
  updateDeviceConfig(deviceId: string, config: Record<string, unknown>) {
    return this.ds.updateDeviceConfig(deviceId, config);
  }

  async getDeviceIoTData(deviceId: string, params: { page?: number; limit?: number; startDate?: string; endDate?: string }): Promise<PaginatedIoTData> {
    const res = (await this.ds.getDeviceIoTData(deviceId, params)) ?? {};
    const rows = (res.data as Record<string, unknown>[]) ?? [];
    return {
      data: rows.map((r) => ({
        id: Number(r.id),
        deviceId: String(r.deviceId ?? r.device_id ?? deviceId),
        data: (r.data as Record<string, unknown>) ?? {},
        timestamp: String(r.timestamp ?? ''),
        location: r.location,
        metadata: r.metadata,
      }) as IoTDataRecord),
      pagination: (res.pagination as PaginatedIoTData['pagination']) ?? { page: 1, limit: params.limit ?? 0, total: 0, pages: 0 },
    };
  }

  async getDeviceStats(deviceId: string): Promise<DeviceStats> {
    const d = (await this.ds.getDeviceStats(deviceId)) ?? {};
    return {
      count: Number(d.count ?? 0),
      firstRecord: d.firstRecord as string | undefined,
      lastRecord: d.lastRecord as string | undefined,
      dataPoints: d.dataPoints as DeviceStats['dataPoints'],
    };
  }

  async exportDeviceData(deviceId: string, startDate: string, endDate: string, format?: string): Promise<Blob> {
    const res = await this.ds.exportDeviceData(deviceId, startDate, endDate, format);
    if (res instanceof Blob) return res;
    const text = typeof res === 'string' ? res : JSON.stringify(res, null, 2);
    return new Blob([text], { type: format === 'csv' ? 'text/csv' : 'application/json' });
  }

  cleanupDeviceData(days?: number) {
    return this.ds.cleanupDeviceData(days);
  }
}

function toDeviceGroup(d: DeviceRowDto): DeviceGroup {
  return {
    deviceId: d.device_id,
    deviceName: d.device_name,
    typeName: d.type_name,
    valueData: d.value_data,
    unit: d.unit,
    status: d.status,
    alarmTitle: d.alarm_title,
    statusWarning: d.status_warning,
    statusAlert: d.status_alert,
    recoveryWarning: d.recovery_warning,
    recoveryAlert: d.recovery_alert,
    icon: d.icon,
    colorNormal: d.color_normal,
    colorWarning: d.color_warning,
    colorAlert: d.color_alert,
  };
}

function toMonitorDevice(d: MonitorDeviceDto): MonitorDevice {
  return {
    deviceId: d.device_id,
    deviceName: d.device_name,
    hardwareId: d.hardware_id,
    typeId: d.type_id,
    typeName: d.type_name,
    locationName: d.location_name,
    unit: d.unit,
    status: d.status,
    measurement: d.measurement,
    valueData: d.value_data,
    alarmTitle: d.alarm_title,
    alarmSubject: d.alarm_subject,
    alarmStatus: d.alarm_status,
    mqttDataValue: d.mqtt_data_value,
    mqttDataControl: d.mqtt_data_control,
    mqttControlOn: d.mqtt_control_on,
    mqttControlOff: d.mqtt_control_off,
    deviceData: d.devicedata,
    icon: d.icon,
    timestamp: d.timestamp,
  };
}

function toAlarm(d: DeviceIoInfoDto): AlarmDeviceStatus {
  return {
    deviceId: d.device_id,
    deviceName: d.device_name,
    typeId: d.type_id,
    typeName: '',
    alarmTitle: d.subject,
    status: d.dataAlarm ? 1 : 0,
    valueData: d.value_data,
    timestamp: d.timestamp,
  };
}

function toChart(d: SensorChartDto | undefined): SensorChartData {
  return { data: d?.data ?? [], date: d?.date ?? [], cache: d?.cache ?? '' };
}
