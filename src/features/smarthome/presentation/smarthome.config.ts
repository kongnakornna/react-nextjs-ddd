/**
 * Smarthome location settings — port of webiot `config/_callapi.php`
 * (`location_id_3`, `location_name_3`, `config_image_dashboard3_*`).
 * Images live in `public/room/**` and are served from `/room/**`.
 */
export interface SmarthomeLocation {
  locationId: number;
  /** MQTT / InfluxDB bucket (`?bucket=`) */
  bucket: string;
  name: string;
  /** Room image with the door closed / opened. */
  bgClosed: string;
  bgOpened: string;
  /** Poll interval of the device data (PHP: setInterval 5000). */
  refreshMs: number;
}

export const SMARTHOME_LOCATION: SmarthomeLocation = {
  locationId: Number(process.env.NEXT_PUBLIC_SMARTHOME_LOCATION_ID || 3),
  bucket: process.env.NEXT_PUBLIC_SMARTHOME_BUCKET || 'ICMON001',
  name: process.env.NEXT_PUBLIC_SMARTHOME_NAME || 'ICMON001',
  bgClosed: '/room/dashboard3/home1.png',
  bgOpened: '/room/dashboard3/home2.png',
  refreshMs: 5000,
};

export interface SmarthomeMenuItem {
  label: string;
  /** i18n key (public/i18n/*.json); `label` is the fallback. */
  labelKey: string;
  href: string;
  icon:
    | 'dashboard'
    | 'settings'
    | 'chart'
    | 'logs'
    | 'alarm'
    | 'calendar'
    | 'control';
  adminOnly?: boolean;
}

/** Side-panel menu (PHP `menu-link`s). Sub pages reuse existing routes. */
export const SMARTHOME_MENU: SmarthomeMenuItem[] = [
  {
    label: 'Dashboard',
    labelKey: 'smarthome.menu.dashboard',
    href: '/monitoring/smarthome',
    icon: 'dashboard',
  },
  {
    label: 'Configuration',
    labelKey: 'smarthome.menu.configuration',
    href: '/monitoring/smarthome/dashboardsetting',
    icon: 'settings',
    adminOnly: true,
  },
  {
    label: 'Analysis Chart',
    labelKey: 'smarthome.menu.analysisChart',
    href: '/iot/reports',
    icon: 'chart',
  },
  {
    label: 'Alarm Log',
    labelKey: 'smarthome.menu.alarmLog',
    href: '/reports/alarm',
    icon: 'logs',
  },
  {
    label: 'Alarm Configuration',
    labelKey: 'smarthome.menu.alarmConfiguration',
    href: '/settings/alarm',
    icon: 'alarm',
    adminOnly: true,
  },
  {
    label: 'Schedule',
    labelKey: 'smarthome.menu.schedule',
    href: '/settings/schedule',
    icon: 'calendar',
  },
  {
    label: 'Control Device',
    labelKey: 'smarthome.menu.controlDevice',
    href: '/settings/devices',
    icon: 'control',
  },
];
