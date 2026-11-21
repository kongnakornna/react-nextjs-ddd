import { smarthome } from '@/src/features/smarthome/presentation/smarthome.container';
import { GetIotDashboardUseCase } from '../domain/use-cases/get-iot-dashboard.use-case';

export const iotDashboard = {
  getSummary: new GetIotDashboardUseCase(smarthome.getDeviceGroups),
};
