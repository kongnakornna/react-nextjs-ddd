import { notAvailable } from '@/src/core/http/api-client';
import { MonitoringDeviceResponseDto } from '../dtos/monitoring.dto';
import { DashboardModule } from '../../domain/entities/monitoring-device.entity';

/**
 * Port of icmonangular MonitoringApiDatasource.
 * Angular called `GET /monitoring/{module}/devices`, which FastAPI (fastapiiot)
 * does not have → ApiNotAvailableError. SmartMonitor uses the iot feature
 * (`/iot/monitordevicegroup`) instead.
 */
export class MonitoringApiDataSource {
  async listByModule(module: DashboardModule): Promise<MonitoringDeviceResponseDto[]> {
    return notAvailable('monitoring', `GET /monitoring/${module}/devices`);
  }
}
