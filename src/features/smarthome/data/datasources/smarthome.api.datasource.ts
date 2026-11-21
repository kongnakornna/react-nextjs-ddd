import {
  API_PREFIX,
  BACKEND_PREFIX,
  api,
  notAvailable,
} from '@/src/core/http/api-client';
import type {
  DashboardConfigDto,
  DeviceGroupResponseDto,
} from '../dtos/smarthome.dto';

const IOT = `${BACKEND_PREFIX}/iot`;

/**
 * Smarthome → FastAPI (fastapiiot, API_TARGET_URL — default http://localhost:8000).
 *
 * | PHP (webiot, legacy)                        | FastAPI                                   |
 * |---------------------------------------------|-------------------------------------------|
 * | GET mqtt3/monitordevicegroup?bucket=        | GET /iot/monitordevicegroup?bucket=       |
 * | GET mqtt3/control?topic=&message=           | POST /iot/control { topic, message }      |
 * | GET/POST settings/dashboardconfig           | NOT IN BACKEND → local fallback (repo)    |
 */
export class SmarthomeApiDataSource {
  getDeviceGroups(params: {
    bucket: string;
    locationId?: number;
    lang?: string;
    delcache?: number;
  }) {
    return api.get<DeviceGroupResponseDto>(`${IOT}/monitordevicegroup`, {
      bucket: params.bucket,
      location_id: params.locationId,
      lang: params.lang,
      delcache: params.delcache,
    });
  }

  control(body: { topic: string; message: string }) {
    return api.post<{ status?: string }>(`${IOT}/control`, body);
  }

  getDashboardConfig(locationId: number): Promise<DashboardConfigDto> {
    return notAvailable(
      'smarthome',
      `GET ${API_PREFIX}/settings/dashboardconfig?location_id=${locationId}`
    );
  }

  saveDashboardConfig(_dto: DashboardConfigDto): Promise<DashboardConfigDto> {
    return notAvailable(
      'smarthome',
      `POST ${API_PREFIX}/settings/dashboardconfig`
    );
  }
}
