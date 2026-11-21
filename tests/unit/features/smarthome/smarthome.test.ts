import { describe, expect, it, vi } from 'vitest';

import { ApiNotAvailableError } from '@/src/core/http/api-client';
import {
  defaultLayout,
  deviceIconKey,
  leaderPath,
  resolvePositions,
  toAlarmLevel,
  worstLevel,
} from '@/src/features/smarthome/domain/services/alarm-level';
import {
  SaveLayoutUseCase,
  ToggleDeviceUseCase,
} from '@/src/features/smarthome/domain/use-cases/smarthome.use-cases';
import type { ISmarthomeRepository } from '@/src/features/smarthome/domain/repositories/smarthome.repository';
import {
  fromConfigDto,
  toConfigDto,
  toSnapshot,
} from '@/src/features/smarthome/data/mappers/smarthome.mapper';
import { SmarthomeRepositoryImpl } from '@/src/features/smarthome/data/repositories/smarthome.repository.impl';
import type { SmarthomeApiDataSource } from '@/src/features/smarthome/data/datasources/smarthome.api.datasource';
import type { SmarthomeLocalDataSource } from '@/src/features/smarthome/data/datasources/smarthome.local.datasource';

const fastapiResponse = {
  bucket: 'ICMON001',
  device_count: 2,
  data: [
    {
      group_id: 1,
      group_name: 'Sensor',
      devices: [
        {
          device_id: 1,
          device_name: 'Temp Room',
          hardware_id: 1,
          value_data: '25.10',
          unit: '°C',
          devicedata: '25.10 °C',
          alarm_status: 1,
          alarm_title: 'Warning',
        },
      ],
    },
    {
      group_id: 3,
      group_name: 'IO Control',
      devices: [
        {
          device_id: 2,
          device_name: 'Fan',
          hardware_id: 3,
          devicedata: 'ON',
          mqtt_data_control: 'home/fan',
          mqtt_control_on: '1',
          mqtt_control_off: '0',
          alarm_status: 5,
        },
      ],
    },
  ],
};

describe('alarm-level', () => {
  it('maps alarm_status like the PHP view', () => {
    expect(toAlarmLevel(1)).toBe('warning');
    expect(toAlarmLevel(2)).toBe('alarm');
    expect(toAlarmLevel(5)).toBe('normal');
    expect(toAlarmLevel(undefined)).toBe('normal');
  });

  it('picks the worst level', () => {
    expect(worstLevel(['normal', 'warning', 'info'])).toBe('warning');
    expect(worstLevel(['warning', 'alarm'])).toBe('alarm');
    expect(worstLevel([])).toBe('normal');
  });

  it('chooses icons by name', () => {
    expect(deviceIconKey('Temp Room')).toBe('temperature');
    expect(deviceIconKey('Humidity')).toBe('humidity');
    expect(deviceIconKey('Light')).toBe('device');
  });

  it('builds the elbow leader path', () => {
    expect(leaderPath({ x: 100, y: 50 }, { x: 10, y: 200 })).toBe(
      'M 10 200 L 10 50 L 100 50'
    );
  });
});

describe('mapper', () => {
  it('maps the FastAPI response', () => {
    const s = toSnapshot(fastapiResponse);
    expect(s.groups.map((g) => g.key)).toEqual(['group1', 'group2']);
    expect(s.groups[0].level).toBe('warning');
    expect(s.groups[1].devices[0]).toMatchObject({
      controlTopic: 'home/fan',
      display: 'ON',
    });
  });

  it('maps the legacy PHP API response', () => {
    const s = toSnapshot({
      statusCode: 200,
      payload: [
        {
          group_name: 'Sensor',
          data: [
            {
              device_id: 9,
              device_name: 'Door',
              hardware_id: 2,
              topicControl: 't',
              datatime: '10:00',
            },
          ],
        },
      ],
    });
    expect(s.groups[0].devices[0]).toMatchObject({
      controlTopic: 't',
      timestamp: '10:00',
    });
    expect(s.deviceCount).toBe(1);
  });

  it('round-trips the dashboard config (PHP payload shape)', () => {
    const layout = {
      ...defaultLayout(3, 'ICMON001'),
      doorOpened: true,
      groups: [
        {
          groupKey: 'group1',
          card: { top: 10, left: 20 },
          target: { top: 30, left: 40 },
        },
      ],
    };
    const dto = toConfigDto(layout);
    expect(dto.config.groups[0].card_pos).toEqual({
      top: '10px',
      left: '20px',
    });
    expect(
      fromConfigDto(
        { ...dto, config: JSON.stringify(dto.config) } as never,
        defaultLayout(3, 'x')
      )
    ).toMatchObject({
      doorOpened: true,
      groups: layout.groups,
    });
  });

  it('fills default positions for unsaved groups', () => {
    const groups = toSnapshot(fastapiResponse).groups;
    const saved = [
      {
        groupKey: 'group2',
        card: { top: 1, left: 2 },
        target: { top: 3, left: 4 },
      },
    ];
    const pos = resolvePositions(groups, saved);
    expect(pos.group2).toBe(saved[0]);
    expect(pos.group1.card).toEqual({ top: 40, left: 40 });
  });
});

describe('use cases', () => {
  const repo = (): ISmarthomeRepository => ({
    getDeviceGroups: vi.fn(),
    control: vi.fn().mockResolvedValue(true),
    getLayout: vi.fn(),
    saveLayout: vi.fn(async (c) => c),
  });

  it('sends ON / OFF messages for an IO Control device', async () => {
    const r = repo();
    const fan = toSnapshot(fastapiResponse).groups[1].devices[0];
    await new ToggleDeviceUseCase(r).execute(fan, false);
    expect(r.control).toHaveBeenCalledWith({ topic: 'home/fan', message: '0' });
  });

  it('refuses to control a sensor', async () => {
    const temp = toSnapshot(fastapiResponse).groups[0].devices[0];
    await expect(
      new ToggleDeviceUseCase(repo()).execute(temp, true)
    ).rejects.toThrow();
  });

  it('clamps opacity and brightness on save', async () => {
    const saved = await new SaveLayoutUseCase(repo()).execute({
      ...defaultLayout(3, 'x'),
      cardOpacity: 500,
      screenBrightness: 1,
    });
    expect(saved.cardOpacity).toBe(100);
    expect(saved.screenBrightness).toBe(20);
  });
});

describe('repository layout fallback', () => {
  it('uses local storage when the backend has no dashboardconfig route', async () => {
    const api = {
      getDashboardConfig: vi
        .fn()
        .mockRejectedValue(new ApiNotAvailableError('smarthome')),
      saveDashboardConfig: vi
        .fn()
        .mockRejectedValue(new ApiNotAvailableError('smarthome')),
    } as unknown as SmarthomeApiDataSource;
    let stored: unknown = null;
    const local = {
      get: vi.fn(() => stored),
      save: vi.fn((dto) => (stored = dto)),
    } as unknown as SmarthomeLocalDataSource;
    const r = new SmarthomeRepositoryImpl(api, local);

    expect((await r.getLayout(3, 'x')).groups).toEqual([]);
    await r.saveLayout({ ...defaultLayout(3, 'x'), cardOpacity: 70 });
    expect((await r.getLayout(3, 'x')).cardOpacity).toBe(70);
  });
});
