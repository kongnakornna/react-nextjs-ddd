'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  IconAdjustmentsHorizontal,
  IconAlarm,
  IconCalendarWeek,
  IconChalkboardTeacher,
  IconChartDots2,
  IconLogs,
  IconToggleRight,
} from '@tabler/icons-react';

import { useI18n } from '@/src/core/services/i18n.service';
import { tf } from '@/src/core/ui/tf';

import { SMARTHOME_MENU, type SmarthomeMenuItem } from '../smarthome.config';
import styles from '../styles/smarthome.module.scss';

const ICONS: Record<SmarthomeMenuItem['icon'], typeof IconLogs> = {
  dashboard: IconChalkboardTeacher,
  settings: IconAdjustmentsHorizontal,
  chart: IconChartDots2,
  logs: IconLogs,
  alarm: IconAlarm,
  calendar: IconCalendarWeek,
  control: IconToggleRight,
};

/** PHP side-panel `menu-link`s. `isAdmin` hides admin-only entries (PHP role_id_api 1|2). */
export function SmarthomeMenu({ isAdmin = true }: { isAdmin?: boolean }) {
  const pathname = usePathname();
  const { t } = useI18n();
  return (
    <nav className={styles.menu} aria-label="Smarthome">
      {SMARTHOME_MENU.filter((m) => isAdmin || !m.adminOnly).map((m) => {
        const Icon = ICONS[m.icon];
        const active = pathname === m.href;
        return (
          <Link
            key={m.href}
            href={m.href}
            className={`${styles.menuLink} ${active ? styles.menuLinkActive : ''}`}
          >
            <Icon size={18} aria-hidden /> {tf(t, m.labelKey, m.label)}
          </Link>
        );
      })}
    </nav>
  );
}
