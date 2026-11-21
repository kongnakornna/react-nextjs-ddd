'use client';

import type { ReactNode } from 'react';

import { SessionKeeper } from '@/app/_components/auth/session-keeper';
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
    // Always 100% wide, even with the Theme Builder "Boxed" layout —
    // see `.page-iot-fullwidth` in app/globals.scss.
    <div className="page page-iot-fullwidth">
      <div className="page-wrapper">
        <IotDashboardHeader home={home} />
        <main className="page-body mt-0" id="content">
          <div className="container-fluid px-0">{children}</div>
        </main>
        <IotDashboardFooter />
      </div>
      <div className="settings">
        <ThemeBuilder />
      </div>
      <SessionKeeper />
    </div>
  );
}
