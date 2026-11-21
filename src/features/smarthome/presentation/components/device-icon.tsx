import {
  IconDeviceAnalytics,
  IconDoor,
  IconDropletHalf,
  IconTemperature,
  IconWind,
} from '@tabler/icons-react';

import { deviceIconKey } from '../../domain/services/alarm-level';

const ICONS = {
  temperature: IconTemperature,
  humidity: IconDropletHalf,
  fan: IconWind,
  door: IconDoor,
  device: IconDeviceAnalytics,
};

export function DeviceIcon({
  name,
  size = 16,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const Icon = ICONS[deviceIconKey(name)];
  return <Icon size={size} className={className} aria-hidden />;
}
