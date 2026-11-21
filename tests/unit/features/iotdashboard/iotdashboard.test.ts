import { describe, expect, it, vi } from 'vitest';

import { GetIotDashboardUseCase } from '@/src/features/iotdashboard/domain/use-cases/get-iot-dashboard.use-case';
import {
  healthyRate,
  percent,
  summarize,
} from '@/src/features/iotdashboard/domain/services/summarize';
import { toSnapshot } from '@/src/features/smarthome/data/mappers/smarthome.mapper';
import type { GetDeviceGroupsUseCase } from '@/src/features/smarthome/domain/use-cases/smarthome.use-cases';

const snapshot = toSnapshot({
  bucket: 'ICMON001',
  data: [
    {
      group_id: 1,
      group_name: 'Sensor',
      devices: [
        {
          device_id: 1,
          device_name: 'Temp',
          hardware_id: 1,
          alarm_status: 1,
          alarm_title: 'Warning',
          devicedata: '31 °C',
        },
        {
          device_id: 2,
          device_name: 'Humi',
          hardware_id: 1,
          alarm_status: 2,
          alarm_title: 'Alarm',
          devicedata: '95 %',
        },
        { device_id: 3, device_name: 'CO2', hardware_id: 1, alarm_status: 5 },
      ],
    },
    {
      group_id: 3,
      group_name: 'IO Control',
      devices: [
        {
          device_id: 4,
          device_name: 'Fan',
          hardware_id: 3,
          devicedata: 'ON',
          mqtt_data_control: 't',
          mqtt_control_on: '1',
          mqtt_control_off: '0',
        },
        {
          device_id: 5,
          device_name: 'Light',
          hardware_id: 3,
          devicedata: 'OFF',
          mqtt_data_control: 't2',
          mqtt_control_on: '1',
          mqtt_control_off: '0',
        },
      ],
    },
  ],
});

describe('iotdashboard summarize', () => {
  it('counts devices by level', () => {
    const s = summarize(snapshot);
    expect(s).toMatchObject({
      totalDevices: 5,
      normalDevices: 3,
      warningDevices: 1,
      alarmDevices: 1,
      controllable: 2,
      controlsOn: 1,
    });
  });

  it('summarizes each group', () => {
    expect(summarize(snapshot).groups[0]).toMatchObject({
      name: 'Sensor',
      total: 3,
      normal: 1,
      warning: 1,
      alarm: 1,
    });
  });

  it('lists alarms before warnings', () => {
    expect(summarize(snapshot).alerts.map((a) => a.name)).toEqual([
      'Humi',
      'Temp',
    ]);
  });

  it('handles an empty bucket', () => {
    const s = summarize(toSnapshot({ bucket: 'X', device_count: 0, data: [] }));
    expect(s.totalDevices).toBe(0);
    expect(healthyRate(s)).toBe(0);
  });

  it('rates', () => {
    expect(healthyRate({ totalDevices: 4, normalDevices: 3 })).toBe(75);
    expect(percent(1, 0)).toBe(0);
  });

  it('use case passes the query through', async () => {
    const execute = vi.fn().mockResolvedValue(snapshot);
    const uc = new GetIotDashboardUseCase({
      execute,
    } as unknown as GetDeviceGroupsUseCase);
    expect(
      (await uc.execute({ bucket: 'ICMON001', lang: 'th' })).totalDevices
    ).toBe(5);
    expect(execute).toHaveBeenCalledWith({ bucket: 'ICMON001', lang: 'th' });
  });
});
