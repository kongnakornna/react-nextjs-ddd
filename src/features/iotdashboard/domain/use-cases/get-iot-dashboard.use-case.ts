import type { GetDeviceGroupsUseCase } from '@/src/features/smarthome/domain/use-cases/smarthome.use-cases';
import type { IotDashboardSummary } from '../entities/iot-dashboard.entity';
import { summarize } from '../services/summarize';

/** Reuses the smarthome device-group source (`GET /iot/monitordevicegroup` on FastAPI :8000). */
export class GetIotDashboardUseCase {
  constructor(private getDeviceGroups: GetDeviceGroupsUseCase) {}

  async execute(query: {
    bucket: string;
    locationId?: number;
    lang?: string;
  }): Promise<IotDashboardSummary> {
    return summarize(await this.getDeviceGroups.execute(query));
  }
}
