import type {
  ControlCommand,
  DashboardLayoutConfig,
  SmartDevice,
} from '../entities/smarthome.entity';
import { isControllable } from '../entities/smarthome.entity';
import type {
  DeviceGroupQuery,
  ISmarthomeRepository,
} from '../repositories/smarthome.repository';
import { clamp } from '../services/alarm-level';

/** PHP: Monitoring API layout=1/2 → `/iot/monitordevicegroup`. */
export class GetDeviceGroupsUseCase {
  constructor(private repo: ISmarthomeRepository) {}
  execute(query: DeviceGroupQuery) {
    return this.repo.getDeviceGroups(query);
  }
}

/** PHP: handleDeviceControl — switch ON/OFF an IO Control device over MQTT. */
export class ToggleDeviceUseCase {
  constructor(private repo: ISmarthomeRepository) {}
  async execute(device: SmartDevice, turnOn: boolean): Promise<boolean> {
    if (!isControllable(device))
      throw new Error(`${device.name} is not controllable`);
    const command: ControlCommand = {
      topic: device.controlTopic,
      message: turnOn ? device.controlOn : device.controlOff,
    };
    return this.repo.control(command);
  }
}

/** PHP: loadConfig — GET settings/dashboardconfig?location_id= */
export class GetLayoutUseCase {
  constructor(private repo: ISmarthomeRepository) {}
  execute(locationId: number, name: string) {
    return this.repo.getLayout(locationId, name);
  }
}

/** PHP: autoSave1 / savesettings — POST settings/dashboardconfig */
export class SaveLayoutUseCase {
  constructor(private repo: ISmarthomeRepository) {}
  execute(config: DashboardLayoutConfig) {
    return this.repo.saveLayout({
      ...config,
      cardOpacity: clamp(Math.round(config.cardOpacity), 10, 100),
      screenBrightness: clamp(Math.round(config.screenBrightness), 20, 350),
      updatedAt: new Date().toISOString(),
    });
  }
}
