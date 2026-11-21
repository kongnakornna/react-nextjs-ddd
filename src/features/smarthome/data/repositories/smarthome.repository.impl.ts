import { isApiNotAvailable } from '@/src/core/http/api-client';
import type {
  ControlCommand,
  DashboardLayoutConfig,
  DeviceGroupSnapshot,
} from '../../domain/entities/smarthome.entity';
import type {
  DeviceGroupQuery,
  ISmarthomeRepository,
} from '../../domain/repositories/smarthome.repository';
import { defaultLayout } from '../../domain/services/alarm-level';
import type { SmarthomeApiDataSource } from '../datasources/smarthome.api.datasource';
import type { SmarthomeLocalDataSource } from '../datasources/smarthome.local.datasource';
import {
  fromConfigDto,
  toConfigDto,
  toSnapshot,
} from '../mappers/smarthome.mapper';

export class SmarthomeRepositoryImpl implements ISmarthomeRepository {
  constructor(
    private api: SmarthomeApiDataSource,
    private local: SmarthomeLocalDataSource
  ) {}

  async getDeviceGroups(query: DeviceGroupQuery): Promise<DeviceGroupSnapshot> {
    return toSnapshot(await this.api.getDeviceGroups(query));
  }

  async control(command: ControlCommand): Promise<boolean> {
    const r = await this.api.control(command);
    return !r?.status || r.status === 'ok';
  }

  async getLayout(
    locationId: number,
    name: string
  ): Promise<DashboardLayoutConfig> {
    const fallback = defaultLayout(locationId, name);
    try {
      return fromConfigDto(
        await this.api.getDashboardConfig(locationId),
        fallback
      );
    } catch (err) {
      if (!isApiNotAvailable(err)) throw err;
      const saved = this.local.get(locationId);
      return saved ? fromConfigDto(saved, fallback) : fallback;
    }
  }

  async saveLayout(
    config: DashboardLayoutConfig
  ): Promise<DashboardLayoutConfig> {
    const dto = toConfigDto(config);
    try {
      await this.api.saveDashboardConfig(dto);
    } catch (err) {
      if (!isApiNotAvailable(err)) throw err;
      this.local.save(dto);
    }
    return config;
  }
}
