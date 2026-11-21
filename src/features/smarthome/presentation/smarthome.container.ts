import { SmarthomeApiDataSource } from '../data/datasources/smarthome.api.datasource';
import { SmarthomeLocalDataSource } from '../data/datasources/smarthome.local.datasource';
import { SmarthomeRepositoryImpl } from '../data/repositories/smarthome.repository.impl';
import * as UC from '../domain/use-cases/smarthome.use-cases';

/** Wiring for the smarthome feature (same pattern as iot.container.ts). */
const repository = new SmarthomeRepositoryImpl(
  new SmarthomeApiDataSource(),
  new SmarthomeLocalDataSource()
);

export const smarthome = {
  repository,
  getDeviceGroups: new UC.GetDeviceGroupsUseCase(repository),
  toggleDevice: new UC.ToggleDeviceUseCase(repository),
  getLayout: new UC.GetLayoutUseCase(repository),
  saveLayout: new UC.SaveLayoutUseCase(repository),
};
