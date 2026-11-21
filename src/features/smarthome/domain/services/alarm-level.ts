import type {
  AlarmLevel,
  DashboardLayoutConfig,
  DeviceGroup,
  GroupPosition,
} from '../entities/smarthome.entity';

/** Backend `alarm_status` → level (PHP: switch(alarmStatus) in updateMenuDisplay). */
export function toAlarmLevel(status: number | null | undefined): AlarmLevel {
  switch (Number(status)) {
    case 1:
      return 'warning';
    case 2:
      return 'alarm';
    case 3:
      return 'minor';
    case 4:
      return 'info';
    default:
      return 'normal';
  }
}

const SEVERITY: Record<AlarmLevel, number> = {
  normal: 0,
  info: 0,
  minor: 0,
  warning: 1,
  alarm: 2,
};

/** Worst level wins (alarm > warning > normal). */
export function worstLevel(levels: AlarmLevel[]): AlarmLevel {
  return levels.reduce<AlarmLevel>(
    (acc, l) => (SEVERITY[l] > SEVERITY[acc] ? l : acc),
    'normal'
  );
}

export const LEVEL_COLOR: Record<AlarmLevel, string> = {
  normal: '#22C55E',
  minor: '#3B82F6',
  info: '#8B5CF6',
  warning: '#F59E0B',
  alarm: '#EF4444',
};

export function levelColor(
  level: AlarmLevel,
  colors?: { normal?: string; warning?: string; alert?: string }
): string {
  if (level === 'warning') return colors?.warning || LEVEL_COLOR.warning;
  if (level === 'alarm') return colors?.alert || LEVEL_COLOR.alarm;
  if (level === 'minor' || level === 'info')
    return colors?.normal || LEVEL_COLOR[level];
  return LEVEL_COLOR.normal;
}

export function isBlinking(level: AlarmLevel): boolean {
  return level === 'warning' || level === 'alarm';
}

/** Icon key from the device name (PHP: strpos($name_lower, 'temp') …). */
export type DeviceIconKey =
  'temperature' | 'humidity' | 'fan' | 'door' | 'device';
export function deviceIconKey(name: string): DeviceIconKey {
  const n = name.toLowerCase();
  if (n.includes('temp')) return 'temperature';
  if (n.includes('humi')) return 'humidity';
  if (n.includes('fan')) return 'fan';
  if (n.includes('door')) return 'door';
  return 'device';
}

/** Default card/target positions — cards spread over the room image. */
export function defaultPosition(
  groupKey: string,
  index: number
): GroupPosition {
  const col = index % 3;
  const row = Math.floor(index / 3);
  return {
    groupKey,
    card: { top: 40 + row * 220, left: 40 + col * 300 },
    target: { top: 200 + row * 220, left: 160 + col * 300 },
  };
}

export function defaultLayout(
  locationId: number,
  name: string
): DashboardLayoutConfig {
  return {
    locationId,
    name,
    doorOpened: false,
    cardOpacity: 40,
    screenBrightness: 100,
    groups: [],
    updatedAt: new Date(0).toISOString(),
  };
}

/** Positions for every group: saved ones first, defaults for the rest. */
export function resolvePositions(
  groups: DeviceGroup[],
  saved: GroupPosition[]
): Record<string, GroupPosition> {
  const out: Record<string, GroupPosition> = {};
  groups.forEach((g, i) => {
    out[g.key] =
      saved.find((p) => p.groupKey === g.key) ?? defaultPosition(g.key, i);
  });
  return out;
}

/** SVG path of the leader line: target → up/down → card centre (PHP updateLines). */
export function leaderPath(
  cardCenter: { x: number; y: number },
  target: { x: number; y: number }
): string {
  return `M ${target.x} ${target.y} L ${target.x} ${cardCenter.y} L ${cardCenter.x} ${cardCenter.y}`;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
