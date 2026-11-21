/**
 * Header menus — port of icmonangular `layouts/header/header.component.ts`
 * (horizontalMenu / apps / profileMenu / notifications).
 *
 * - `labelKey` is an i18n key in public/i18n/*.json; `label` is the fallback.
 * - `icon` is a lucide-react icon name (see app/_components/layout/tabler/nav-icon.tsx).
 * - Routes point at pages that exist under app/(dashboard). Angular entries with
 *   no matching page here (e.g. /invoices, /jobs, /analytics, /schedule/*,
 *   /iot/alerts, /mqtt/*) were left out — see docs/themoption.md.
 */
export interface NavItem {
  labelKey: string;
  label: string;
  icon?: string;
  href?: string;
  /** profile menu only */
  action?: 'logout';
  divider?: boolean;
  children?: NavItem[];
}

export const HORIZONTAL_MENU: NavItem[] = [
  { labelKey: 'nav.dashboard', label: 'Dashboard', icon: 'LayoutDashboard', href: '/dashboard' },
  {
    labelKey: 'nav.monitoring',
    label: 'Monitoring',
    icon: 'Activity',
    href: '/monitoring',
    children: [
      { labelKey: 'nav.smartmonitor', label: 'SmartMonitor', icon: 'MonitorDot', href: '/monitoring/smartmonitor' },
      { labelKey: 'nav.smarthome', label: 'SmartHome', icon: 'Home', href: '/monitoring/smarthome' },
      { labelKey: 'nav.smartcity', label: 'SmartCity', icon: 'Building2', href: '/monitoring/smartcity' },
      { labelKey: 'nav.smartsolarfarm', label: 'SmartSolarFarm', icon: 'Sun', href: '/monitoring/smartsolarfarm' },
      { labelKey: 'nav.industry', label: 'Industry', icon: 'Factory', href: '/monitoring/industry' },
    ],
  },
  {
    labelKey: 'nav.iot',
    label: 'IoT',
    icon: 'Cpu',
    href: '/iot/devices',
    children: [
      {
        labelKey: 'nav.iotDevices',
        label: 'IoT Devices',
        icon: 'Monitor',
        children: [
          { labelKey: 'nav.iotDevices', label: 'IoT Devices', icon: 'Monitor', href: '/iot/devices' },
          { labelKey: 'nav.devices', label: 'Device Map', icon: 'Map', href: '/iot/map' },
        ],
      },
      { labelKey: 'nav.reports', label: 'Reports', icon: 'BarChart', href: '/iot/reports' },
      { labelKey: 'nav.iotSettings', label: 'IoT Settings', icon: 'Settings', href: '/iot/settings' },
      { labelKey: 'nav.schedule', label: 'Schedule', icon: 'CalendarClock', href: '/settings/schedule' },
    ],
  },
  {
    labelKey: 'nav.users',
    label: 'Users',
    icon: 'Users',
    href: '/user/listdata',
    children: [
      {
        labelKey: 'nav.userManagement',
        label: 'User Management',
        icon: 'Users',
        children: [
          { labelKey: 'nav.userList', label: 'User List', icon: 'List', href: '/user/listdata' },
          { labelKey: 'nav.createUser', label: 'Create User', icon: 'Plus', href: '/user/create' },
        ],
      },
      { labelKey: 'nav.roles', label: 'Roles', icon: 'Shield', href: '/user/roles' },
    ],
  },
  {
    labelKey: 'nav.service',
    label: 'Service',
    icon: 'Briefcase',
    href: '/quotations',
    children: [
      {
        labelKey: 'nav.finance',
        label: 'Finance',
        icon: 'CreditCard',
        children: [
          { labelKey: 'nav.payments', label: 'Payments', icon: 'CreditCard', href: '/payments' },
          { labelKey: 'nav.quotations', label: 'Quotations', icon: 'FileText', href: '/quotations' },
          { labelKey: 'nav.purchaseOrders', label: 'Purchase Orders', icon: 'ShoppingCart', href: '/purchase-orders' },
        ],
      },
      {
        labelKey: 'nav.operations',
        label: 'Operations',
        icon: 'Briefcase',
        children: [
          { labelKey: 'nav.customers', label: 'Customers', icon: 'Users', href: '/customers' },
          { labelKey: 'nav.wos', label: 'Work Orders', icon: 'ClipboardList', href: '/wos/orders' },
          { labelKey: 'nav.batchJobs', label: 'Batch Jobs', icon: 'Layers', href: '/batch/jobs' },
          { labelKey: 'nav.products', label: 'Products', icon: 'Package', href: '/products' },
          { labelKey: 'nav.documents', label: 'Documents', icon: 'Folder', href: '/documents' },
        ],
      },
      {
        labelKey: 'nav.email',
        label: 'Email',
        icon: 'Mail',
        children: [
          { labelKey: 'nav.emailTemplates', label: 'Templates', icon: 'Mail', href: '/email/templates' },
          { labelKey: 'nav.emailCompose', label: 'Compose', icon: 'Pencil', href: '/email/compose' },
          { labelKey: 'nav.emailLogs', label: 'Logs', icon: 'ListChecks', href: '/email/logs' },
        ],
      },
    ],
  },
  {
    labelKey: 'nav.settings',
    label: 'Settings',
    icon: 'Settings',
    href: '/settings',
    children: [
      {
        labelKey: 'nav.automation',
        label: 'Automation',
        icon: 'CalendarClock',
        children: [{ labelKey: 'nav.schedule', label: 'Schedule', icon: 'CalendarClock', href: '/settings/schedule' }],
      },
      {
        labelKey: 'nav.alerting',
        label: 'Alerting',
        icon: 'Bell',
        children: [{ labelKey: 'nav.alarm', label: 'Alarm', icon: 'Bell', href: '/settings/alarm' }],
      },
      {
        labelKey: 'nav.storage',
        label: 'Storage',
        icon: 'Database',
        children: [{ labelKey: 'nav.influxdb', label: 'InfluxDB', icon: 'Database', href: '/settings/influxdb' }],
      },
      {
        labelKey: 'nav.device',
        label: 'Device',
        icon: 'Monitor',
        children: [
          { labelKey: 'nav.devices', label: 'Devices', icon: 'Monitor', href: '/settings/devices' },
          { labelKey: 'nav.locations', label: 'Locations', icon: 'MapPin', href: '/settings/locations' },
          { labelKey: 'nav.hardware', label: 'Hardware', icon: 'Cpu', href: '/settings/hardware' },
          { labelKey: 'nav.sensors', label: 'Sensors', icon: 'Thermometer', href: '/settings/sensors' },
        ],
      },
      {
        labelKey: 'nav.connectivity',
        label: 'Connectivity',
        icon: 'Radio',
        children: [
          { labelKey: 'nav.nodered', label: 'Node-RED', icon: 'Server', href: '/settings/nodered' },
          { labelKey: 'nav.mqtt', label: 'MQTT', icon: 'Radio', href: '/settings/mqtt' },
        ],
      },
      {
        labelKey: 'nav.notification',
        label: 'Notification',
        icon: 'Mail',
        children: [
          { labelKey: 'nav.email', label: 'Email', icon: 'Mail', href: '/settings/email' },
          { labelKey: 'nav.line', label: 'LINE', icon: 'MessageCircle', href: '/settings/line' },
          { labelKey: 'nav.sms', label: 'SMS', icon: 'Phone', href: '/settings/sms' },
        ],
      },
      {
        labelKey: 'nav.system',
        label: 'System',
        icon: 'Server',
        children: [
          { labelKey: 'nav.hosts', label: 'Hosts', icon: 'Server', href: '/settings/hosts' },
          { labelKey: 'nav.api', label: 'API', icon: 'Webhook', href: '/settings/api' },
          { labelKey: 'nav.tokens', label: 'Tokens', icon: 'KeyRound', href: '/settings/tokens' },
        ],
      },
    ],
  },
  {
    labelKey: 'nav.reports',
    label: 'Reports',
    icon: 'FileBarChart',
    href: '/reports',
    children: [
      {
        labelKey: 'nav.iotReports',
        label: 'IoT Reports',
        icon: 'BarChart',
        children: [
          { labelKey: 'nav.scheduleReport', label: 'Schedule Report', icon: 'CalendarClock', href: '/reports/schedule' },
          { labelKey: 'nav.alarmReport', label: 'Alarm Report', icon: 'Bell', href: '/reports/alarm' },
          { labelKey: 'nav.logsControlReport', label: 'Logs Control Report', icon: 'ListChecks', href: '/reports/logs-control' },
          { labelKey: 'nav.deviceReport', label: 'Device Report', icon: 'Monitor', href: '/reports/device' },
        ],
      },
    ],
  },
  {
    labelKey: 'nav.ai',
    label: 'AI',
    icon: 'Sparkles',
    href: '/ai-analytics',
    children: [
      { labelKey: 'nav.dashboard', label: 'Dashboard', icon: 'AreaChart', href: '/ai-analytics' },
      { labelKey: 'aiChat.title', label: 'Chatbot', icon: 'Bot', href: '/ai-chatbot' },
    ],
  },
];

/** "Apps" grid dropdown in the header. */
export const APPS_MENU: NavItem[] = [
  { labelKey: 'layout.header.appDashboard', label: 'Dashboard', icon: 'LayoutDashboard', href: '/dashboard' },
  { labelKey: 'layout.header.appCustomers', label: 'Customers', icon: 'Users', href: '/customers' },
  { labelKey: 'layout.header.appQuotations', label: 'Quotations', icon: 'FileText', href: '/quotations' },
  { labelKey: 'layout.header.appPurchaseOrders', label: 'Purchase Orders', icon: 'ShoppingCart', href: '/purchase-orders' },
  { labelKey: 'layout.header.appProducts', label: 'Products', icon: 'Package', href: '/products' },
  { labelKey: 'layout.header.appPayments', label: 'Payments', icon: 'CreditCard', href: '/payments' },
  { labelKey: 'layout.header.appDocuments', label: 'Documents', icon: 'Folder', href: '/documents' },
  { labelKey: 'layout.header.appWorkOrders', label: 'Work Orders', icon: 'ClipboardList', href: '/wos/orders' },
  { labelKey: 'layout.header.appBatchJobs', label: 'Batch Jobs', icon: 'Layers', href: '/batch/jobs' },
  { labelKey: 'layout.header.appIoTDevices', label: 'IoT Devices', icon: 'Cpu', href: '/iot/devices' },
  { labelKey: 'layout.header.appReports', label: 'Reports', icon: 'FileBarChart', href: '/reports' },
  { labelKey: 'layout.header.appEmail', label: 'Email', icon: 'Mail', href: '/email/templates' },
  { labelKey: 'layout.header.appUsers', label: 'Users', icon: 'User', href: '/user/listdata' },
  { labelKey: 'layout.header.appAI', label: 'AI', icon: 'Bot', href: '/ai-analytics' },
];

/** Profile dropdown. `action: 'logout'` opens the sign-out confirmation. */
export const PROFILE_MENU: NavItem[] = [
  { labelKey: 'layout.header.settingsPrivacy', label: 'Settings & Privacy', icon: 'Settings', href: '/settings' },
  { labelKey: 'layout.header.lockScreen', label: 'Lock Screen', icon: 'Lock', href: '/lock-screen' },
  { labelKey: '', label: '', divider: true },
  { labelKey: 'layout.header.signOut', label: 'Sign out', icon: 'LogOut', action: 'logout' },
];

/** Demo notifications — same as the Angular header (no backend endpoint yet). */
export const DEMO_NOTIFICATIONS = [
  { id: 1, titleKey: 'layout.header.notifNewJob', timeKey: 'layout.header.notifTime5min', read: false },
  { id: 2, titleKey: 'layout.header.notifQuotationApproved', timeKey: 'layout.header.notifTime1hour', read: false },
  { id: 3, titleKey: 'layout.header.notifLowStock', timeKey: 'layout.header.notifTime2hours', read: true },
];
