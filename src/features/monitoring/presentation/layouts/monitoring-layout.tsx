'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Building2, Factory, Home, Sun } from 'lucide-react';

import { useI18n } from '@/src/core/services/i18n.service';
import { tf } from '@/src/core/ui/tf';

const NAV = [
  { key: 'smarthome', href: '/monitoring/smarthome', label: 'SmartHome', Icon: Home },
  { key: 'smartcity', href: '/monitoring/smartcity', label: 'SmartCity', Icon: Building2 },
  { key: 'smartmonitor', href: '/monitoring/smartmonitor', label: 'SmartMonitor', Icon: Activity },
  { key: 'industry', href: '/monitoring/industry', label: 'Industry', Icon: Factory },
  { key: 'smartsolarfarm', href: '/monitoring/smartsolarfarm', label: 'SmartSolarFarm', Icon: Sun },
];

/**
 * Port of icmonangular monitoring-layout (its sidebar is commented out there;
 * modules are shown as Tabler tabs here).
 */
export default function MonitoringLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <>
      <div className="mb-3 overflow-auto">
        <ul className="nav nav-tabs flex-nowrap" role="tablist">
          {NAV.map(({ key, href, label, Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <li className="nav-item" key={key} role="presentation">
                <Link href={href} className={`nav-link text-nowrap${active ? ' active' : ''}`} aria-current={active ? 'page' : undefined}>
                  <Icon className="icon me-2" />
                  {tf(t, `monitoring.modules.${key}`, label)}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      {children}
    </>
  );
}
