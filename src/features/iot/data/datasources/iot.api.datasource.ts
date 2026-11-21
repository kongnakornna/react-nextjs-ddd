import { BACKEND_PREFIX, api, apiRequest, notAvailable } from '@/src/core/http/api-client';
import type {
  AlarmDeviceStatusDto, DevicePageDto, DeviceRowDto, IoTStatusDto, MonitorDeviceGroupDto, SensorChartDto,
} from '../dtos/iot.dto';

const IOT = `${BACKEND_PREFIX}/iot`;

/**
 * Port of icmonangular IoTApiDataSource → FastAPI `/iot/*` (via Next proxy `/backend`).
 * Query names follow FastAPI (e.g. `hardware_id`, `location_id`), not the old Go API.
 */
export class IoTApiDataSource {
  // ── not on FastAPI yet ──────────────────────────────────────────────────
  listDevices(): Promise<unknown[]> {
    return notAvailable('iot', 'GET /iot/devices');
  }
  registerDevice(_data: unknown): Promise<unknown> {
    return notAvailable('iot', 'POST /iot/devices');
  }
  getDeviceLocation(id: string): Promise<unknown> {
    return notAvailable('iot', `GET /iot/devices/${id}/location`);
  }
  getDeviceHistory(id: string, _startDate: Date, _endDate: Date): Promise<unknown[]> {
    return notAvailable('iot', `GET /iot/devices/${id}/history`);
  }
  getSensorData(id: string): Promise<unknown[]> {
    return notAvailable('iot', `GET /iot/devices/${id}/sensors`);
  }

  // ── FastAPI ─────────────────────────────────────────────────────────────
  getStatus() {
    return api.get<IoTStatusDto>(`${IOT}/status`);
  }

  getTopicData(topic: string, delcache?: string) {
    return api.get<Record<string, unknown>>(`${IOT}/topic`, { topic, delcache });
  }

  getTopicDeviceChart(params: { topic: string; bucket?: string; measurement?: string; field?: string; start?: string; stop?: string; limit?: number; delcache?: string }) {
    return api.get<unknown>(`${IOT}/topicdevicechart`, params);
  }

  getControls(topic: string, message: string) {
    return api.get<unknown>(`${IOT}/controls`, { topic, message });
  }

  postControl(data: { topic: string; message: string }) {
    return api.post<unknown>(`${IOT}/control`, data);
  }

  getMonitorDeviceGroup(params?: { bucket?: string; locationId?: string; hardwareId?: string; lang?: string }) {
    return api.get<MonitorDeviceGroupDto>(`${IOT}/monitordevicegroup`, {
      bucket: params?.bucket,
      location_id: params?.locationId,
      hardware_id: params?.hardwareId,
      lang: params?.lang,
    });
  }

  getMonitorDeviceChart(params: { bucket: string; measurement?: string; field?: string; start?: string; stop?: string; limit?: number }) {
    return api.get<SensorChartDto>(`${IOT}/monitordevicechart`, params);
  }

  getDeviceBuckets(bucket: string) {
    return api.get<{ bucket: string; devices: DeviceRowDto[] }>(`${IOT}/devicebuckets`, { bucket });
  }

  listDevicesPaginated(params: { page?: number; pageSize?: number; bucket?: string; hardwareId?: string; keyword?: string; lang?: string }) {
    return api.get<DevicePageDto>(`${IOT}/device`, {
      page: params.page,
      pageSize: params.pageSize,
      bucket: params.bucket,
      hardware_id: params.hardwareId,
      keyword: params.keyword,
      lang: params.lang,
    });
  }

  getSenserCharts(params: { bucket: string; measurement: string; field?: string; start?: string; stop?: string; limit?: number }) {
    return api.get<SensorChartDto>(`${IOT}/sensercharts`, params);
  }

  getDeviceSenserCharts(params: { bucket: string; measurement: string; field?: string; start?: string; stop?: string; limit?: number }) {
    return api.get<SensorChartDto>(`${IOT}/devicesensercharts`, params);
  }

  getLocationDevice(locationId: number) {
    return api.get<DeviceRowDto[]>(`${IOT}/locationdevice`, { location_id: locationId });
  }

  getAlarmDeviceStatus() {
    return api.get<AlarmDeviceStatusDto>(`${IOT}/alarmdevicestatus`);
  }

  getAlarmDeviceStatusControl() {
    return api.get<AlarmDeviceStatusDto>(`${IOT}/alarmdevicestatuscontrol`);
  }

  getDeviceStatus(deviceId: string) {
    return api.get<Record<string, unknown>>(`${IOT}/devicestatus`, { deviceId });
  }

  updateDeviceStatus(deviceId: string, data: Record<string, unknown>) {
    return apiRequest<unknown>(`${IOT}/devicestatus`, { method: 'PUT', query: { deviceId }, body: data });
  }

  getDeviceConfig(deviceId: string) {
    return api.get<Record<string, unknown>>(`${IOT}/deviceconfig`, { deviceId });
  }

  updateDeviceConfig(deviceId: string, config: Record<string, unknown>) {
    return apiRequest<unknown>(`${IOT}/updatedeviceconfig`, { method: 'PUT', query: { deviceId }, body: { config } });
  }

  getDeviceIoTData(deviceId: string, params: { page?: number; limit?: number; startDate?: string; endDate?: string }) {
    return api.get<Record<string, unknown>>(`${IOT}/deviceiotdata`, { deviceId, ...params });
  }

  getDeviceStats(deviceId: string) {
    return api.get<Record<string, unknown>>(`${IOT}/devicestats`, { deviceId });
  }

  exportDeviceData(deviceId: string, startDate: string, endDate: string, format?: string) {
    return api.get<Blob | string>(`${IOT}/devicedataexport`, { deviceId, startDate, endDate, format });
  }

  cleanupDeviceData(days?: number) {
    return apiRequest<void>(`${IOT}/devicedatacleanup`, { method: 'DELETE', query: { days } });
  }
}
