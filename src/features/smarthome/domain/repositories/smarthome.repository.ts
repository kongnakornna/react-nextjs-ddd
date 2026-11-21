import type {
  ControlCommand,
  DashboardLayoutConfig,
  DeviceGroupSnapshot,
} from '../entities/smarthome.entity';

export interface DeviceGroupQuery {
  bucket: string;
  locationId?: number;
  lang?: string;
}

export interface ISmarthomeRepository {
  getDeviceGroups(query: DeviceGroupQuery): Promise<DeviceGroupSnapshot>;
  control(command: ControlCommand): Promise<boolean>;
  getLayout(locationId: number, name: string): Promise<DashboardLayoutConfig>;
  saveLayout(config: DashboardLayoutConfig): Promise<DashboardLayoutConfig>;
}
