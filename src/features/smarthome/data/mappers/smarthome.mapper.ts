import type {
  DashboardLayoutConfig,
  DeviceGroup,
  DeviceGroupSnapshot,
  SmartDevice,
} from '../../domain/entities/smarthome.entity';
import { toAlarmLevel, worstLevel } from '../../domain/services/alarm-level';
import type {
  DashboardConfigDto,
  DeviceGroupDto,
  DeviceGroupResponseDto,
  SmartDeviceDto,
} from '../dtos/smarthome.dto';

export function toDevice(d: SmartDeviceDto): SmartDevice {
  const value = d.value_data ?? '';
  const unit = d.unit ?? '';
  return {
    id: Number(d.device_id),
    name: d.device_name || 'Unknown',
    hardwareId: Number(d.hardware_id) || 0,
    typeName: d.type_name ?? '',
    unit,
    value,
    display: d.devicedata || (value ? `${value} ${unit}`.trim() : 'N/A'),
    alarmLevel: toAlarmLevel(d.alarm_status ?? 5),
    alarmTitle: d.alarm_title || '',
    measurement: d.measurement ?? '',
    controlTopic: d.mqtt_data_control || d.topicControl || '',
    controlOn: d.mqtt_control_on ?? '',
    controlOff: d.mqtt_control_off ?? '',
    timestamp: d.timestamp || d.datatime || '',
    colors: {
      normal: d.color_normal,
      warning: d.color_warning,
      alert: d.color_alert,
    },
  };
}

export function toGroup(g: DeviceGroupDto, index: number): DeviceGroup {
  const devices = (g.devices ?? g.data ?? []).map(toDevice);
  return {
    key: `group${index + 1}`,
    groupId: g.group_id ?? index + 1,
    name: g.group_name || `Device Group ${index + 1}`,
    devices,
    level: worstLevel(devices.map((d) => d.alarmLevel)),
  };
}

export function toSnapshot(
  r: DeviceGroupResponseDto | null | undefined
): DeviceGroupSnapshot {
  const raw = (Array.isArray(r?.data) ? r?.data : r?.payload) ?? [];
  const groups = raw.filter((g) => g && g.group_name).map(toGroup);
  return {
    bucket: r?.bucket ?? '',
    timestamp: r?.timestamp ?? new Date().toISOString(),
    deviceCount:
      r?.device_count ?? groups.reduce((n, g) => n + g.devices.length, 0),
    groups,
  };
}

const px = (n: number) => `${Math.round(n)}px`;
const num = (s: string | undefined, fallback: number) => {
  const n = parseFloat(s ?? '');
  return Number.isFinite(n) ? n : fallback;
};

export function toConfigDto(c: DashboardLayoutConfig): DashboardConfigDto {
  return {
    name: c.name,
    location_id: c.locationId,
    config: {
      updated_at: c.updatedAt,
      door_status: c.doorOpened ? 'opened' : 'closed',
      global_settings: {
        card_opacity: c.cardOpacity,
        screen_brightness: c.screenBrightness,
      },
      groups: c.groups.map((g) => ({
        group_id: g.groupKey,
        card_pos: { top: px(g.card.top), left: px(g.card.left) },
        target_pos: { top: px(g.target.top), left: px(g.target.left) },
      })),
    },
  };
}

/** Accepts the PHP payload (`config` may be a JSON string, snake or camel case). */
export function fromConfigDto(
  dto: Partial<DashboardConfigDto> & { config?: unknown },
  fallback: DashboardLayoutConfig
): DashboardLayoutConfig {
  const cfg: Record<string, any> =
    typeof dto.config === 'string'
      ? JSON.parse(dto.config)
      : (dto.config ?? {});
  const gs = cfg.global_settings ?? cfg.globalSettings ?? {};
  const groups = (Array.isArray(cfg.groups) ? cfg.groups : []).map((g: any) => {
    const c = g.card_pos ?? g.cardPos ?? {};
    const t = g.target_pos ?? g.targetPos ?? {};
    return {
      groupKey: String(g.group_id ?? g.groupId),
      card: { top: num(c.top, 50), left: num(c.left, 50) },
      target: { top: num(t.top, 150), left: num(t.left, 100) },
    };
  });
  return {
    locationId: Number(dto.location_id ?? fallback.locationId),
    name: dto.name ?? fallback.name,
    doorOpened: cfg.door_status === 'opened',
    cardOpacity: Number(
      gs.card_opacity ?? gs.cardOpacity ?? fallback.cardOpacity
    ),
    screenBrightness: Number(
      gs.screen_brightness ?? gs.screenBrightness ?? fallback.screenBrightness
    ),
    groups,
    updatedAt: cfg.updated_at ?? fallback.updatedAt,
  };
}
