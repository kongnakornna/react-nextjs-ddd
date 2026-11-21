import { IoTApiDataSource } from '../data/datasources/iot.api.datasource';
import { IoTRepositoryImpl } from '../data/repositories/iot.repository.impl';
import * as UC from '../domain/use-cases/iot.use-cases';

/** Wiring for the iot feature (Angular: providers / DI tokens). */
const repository = new IoTRepositoryImpl(new IoTApiDataSource());

export const iot = {
  repository,
  listDevicesPaginated: new UC.ListDevicesPaginatedUseCase(repository),
  getAlarmDeviceStatus: new UC.GetAlarmDeviceStatusUseCase(repository),
  getStatus: new UC.GetIoTStatusUseCase(repository),
  getDeviceStatus: new UC.GetDeviceStatusUseCase(repository),
  getDeviceStats: new UC.GetDeviceStatsUseCase(repository),
  getDeviceConfig: new UC.GetDeviceConfigUseCase(repository),
  updateDeviceConfig: new UC.UpdateDeviceConfigUseCase(repository),
  getDeviceIoTData: new UC.GetDeviceIoTDataUseCase(repository),
  getMonitorDeviceGroup: new UC.GetMonitorDeviceGroupUseCase(repository),
  getMonitorDeviceChart: new UC.GetMonitorDeviceChartUseCase(repository),
  getControls: new UC.GetControlsUseCase(repository),
  postControl: new UC.PostControlUseCase(repository),
  exportDeviceData: new UC.ExportDeviceDataUseCase(repository),
  cleanupDeviceData: new UC.CleanupDeviceDataUseCase(repository),
  getDeviceLocation: new UC.GetDeviceLocationUseCase(repository),
};
