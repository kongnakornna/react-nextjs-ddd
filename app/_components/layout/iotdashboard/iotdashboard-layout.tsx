'use client';

import type { ReactNode } from 'react';

import { ThemeBuilder } from '@/app/_components/auth/theme-builder';
import { useTheme } from '@/src/core/services/theme.service';
import { IotDashboardFooter } from './iotdashboard-footer';
import { IotDashboardHeader } from './iotdashboard-header';

/**
 * "iotdashboard" template — port of webiot `template/templatevertical4.php`:
 *
 *   header_vertical2.php         → <head>/CSS (already global: app/layout.tsx + globals.scss)
 *   pagewrapper_dasdboard_iot    → .page-wrapper + <IotDashboardHeader/>
 *   content_view                 → {children}  (full width, container-fluid)
 *   footer_vertical4m.php        → <IotDashboardFooter/> + floating Theme Builder button
 *   theme_builder.php            → <ThemeBuilder/> (localStorage `tabler-*`, same keys)
 *
 * Use it for any full-screen IoT dashboard (smarthome, smartcity, …) via a
 * route-group layout, e.g. `app/(iotdashboard)/layout.tsx`.
 */
export function IotDashboardLayout({
  children,
  home,
}: {
  children: ReactNode;
  home?: string;
}) {
  useTheme(); // apply saved theme / layout settings

  return (
    <div className="page">
      <div className="page-wrapper">
        <IotDashboardHeader home={home} />
        <main className="page-body mt-0" id="content">
          <div className="container-fluid px-2">{children}</div>
        </main>
        <IotDashboardFooter />
      </div>
      <div className="settings">
        <ThemeBuilder />
      </div>
    </div>
  );
}
