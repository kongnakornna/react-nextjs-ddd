import type { ChartParams, Device, DeviceListParams } from '../entities/device.entity';
import type { IIoTRepository } from '../repositories/iot.repository';

/**
 * Port of icmonangular features/iot/domain/use-cases/*.use-case.ts
 * (one class per Angular use case, same names).
 */
export class ListDevicesUseCase {
  constructor(private repo: IIoTRepository) {}
  execute() { return this.repo.listDevices(); }
}
export class RegisterDeviceUseCase {
  constructor(private repo: IIoTRepository) {}
  execute(device: Partial<Device>) { return this.repo.registerDevice(device); }
}
export class GetDeviceLocationUseCase {
  constructor(private repo: IIoTRepository) {}
  execute(id: string) { return this.repo.getDeviceLocation(id); }
}
export class GetDeviceHistoryUseCase {
  constructor(private repo: IIoTRepository) {}
  execute(id: string, startDate: Date, endDate: Date) { return this.repo.getDeviceHistory(id, startDate, endDate); }
}
export class GetSensorDataUseCase {
  constructor(private repo: IIoTRepository) {}
  execute(id: string) { return this.repo.getSensorData(id); }
}
export class GetIoTStatusUseCase {
  constructor(private repo: IIoTRepository) {}
  execute() { return this.repo.getStatus(); }
}
export class GetTopicDataUseCase {
  constructor(private repo: IIoTRepository) {}
  execute(topic: string, delcache?: string) { return this.repo.getTopicData(topic, delcache); }
}
export class GetTopicDeviceChartUseCase {
  constructor(private repo: IIoTRepository) {}
  execute(params: Parameters<IIoTRepository['getTopicDeviceChart']>[0]) { return this.repo.getTopicDeviceChart(params); }
}
export class GetControlsUseCase {
  constructor(private repo: IIoTRepository) {}
  execute(topic: string, message: string) { return this.repo.getControls(topic, message); }
}
export class PostControlUseCase {
  constructor(private repo: IIoTRepository) {}
  execute(data: { topic: string; message: string }) { return this.repo.postControl(data); }
}
export class GetMonitorDeviceGroupUseCase {
  constructor(private repo: IIoTRepository) {}
  execute(params?: Parameters<IIoTRepository['getMonitorDeviceGroup']>[0]) { return this.repo.getMonitorDeviceGroup(params); }
}
export class GetMonitorDeviceChartUseCase {
  constructor(private repo: IIoTRepository) {}
  execute(params: Partial<ChartParams> & { bucket: string }) { return this.repo.getMonitorDeviceChart(params); }
}
export class GetDeviceBucketsUseCase {
  constructor(private repo: IIoTRepository) {}
  execute(bucket: string) { return this.repo.getDeviceBuckets(bucket); }
}
export class ListDevicesPaginatedUseCase {
  constructor(private repo: IIoTRepository) {}
  execute(params: DeviceListParams) { return this.repo.listDevicesPaginated(params); }
}
export class GetSenserChartsUseCase {
  constructor(private repo: IIoTRepository) {}
  execute(params: ChartParams) { return this.repo.getSenserCharts(params); }
}
export class GetDeviceSenserChartsUseCase {
  constructor(private repo: IIoTRepository) {}
  execute(params: ChartParams) { return this.repo.getDeviceSenserCharts(params); }
}
export class GetLocationDeviceUseCase {
  constructor(private repo: IIoTRepository) {}
  execute(locationId: number) { return this.repo.getLocationDevice(locationId); }
}
export class GetAlarmDeviceStatusUseCase {
  constructor(private repo: IIoTRepository) {}
  execute() { return this.repo.getAlarmDeviceStatus(); }
}
export class GetAlarmDeviceStatusControlUseCase {
  constructor(private repo: IIoTRepository) {}
  execute() { return this.repo.getAlarmDeviceStatusControl(); }
}
export class GetDeviceStatusUseCase {
  constructor(private repo: IIoTRepository) {}
  execute(deviceId: string) { return this.repo.getDeviceStatus(deviceId); }
}
export class UpdateDeviceStatusUseCase {
  constructor(private repo: IIoTRepository) {}
  execute(deviceId: string, data: Record<string, unknown>) { return this.repo.updateDeviceStatus(deviceId, data); }
}
export class GetDeviceConfigUseCase {
  constructor(private repo: IIoTRepository) {}
  execute(deviceId: string) { return this.repo.getDeviceConfig(deviceId); }
}
export class UpdateDeviceConfigUseCase {
  constructor(private repo: IIoTRepository) {}
  execute(deviceId: string, config: Record<string, unknown>) { return this.repo.updateDeviceConfig(deviceId, config); }
}
export class GetDeviceIoTDataUseCase {
  constructor(private repo: IIoTRepository) {}
  execute(deviceId: string, params: { page?: number; limit?: number; startDate?: string; endDate?: string }) {
    return this.repo.getDeviceIoTData(deviceId, params);
  }
}
export class GetDeviceStatsUseCase {
  constructor(private repo: IIoTRepository) {}
  execute(deviceId: string) { return this.repo.getDeviceStats(deviceId); }
}
export class ExportDeviceDataUseCase {
  constructor(private repo: IIoTRepository) {}
  execute(deviceId: string, startDate: string, endDate: string, format?: string) {
    return this.repo.exportDeviceData(deviceId, startDate, endDate, format);
  }
}
export class CleanupDeviceDataUseCase {
  constructor(private repo: IIoTRepository) {}
  execute(days?: number) { return this.repo.cleanupDeviceData(days); }
}
