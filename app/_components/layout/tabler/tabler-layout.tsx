'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { SessionKeeper } from '@/app/_components/auth/session-keeper';
import { ThemeBuilder } from '@/app/_components/auth/theme-builder';
import { useI18n } from '@/src/core/services/i18n.service';
import { useTheme } from '@/src/core/services/theme.service';
import { TablerFooter } from './tabler-footer';
import { TablerHeader } from './tabler-header';

/**
 * App shell — port of icmonangular `layouts/app-layout`.
 *
 *   skip-link
 *   .page
 *     <TablerHeader/>            navbar + horizontal menu
 *     .page-wrapper
 *       main.page-body#content > .container-xl > {children}
 *       <TablerFooter/>
 *   <ThemeBuilder/>               Theme Settings off-canvas (only on /settings*)
 */
export function TablerLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { t } = useI18n();
  useTheme(); // load saved theme/layout (applies layout-boxed on <body>)

  const skip = t('layout.skipLink');

  return (
    <>
      <a href="#content" className="visually-hidden-focusable skip-link">
        {skip && skip !== 'layout.skipLink' ? skip : 'Skip to content'}
      </a>
      <div className="page">
        <TablerHeader />
        <div className="page-wrapper">
          <main className="page-body" id="content">
            <div className="container-xl">{children}</div>
          </main>
          <TablerFooter />
        </div>
      </div>
      {pathname.startsWith('/settings') && <ThemeBuilder />}
      <SessionKeeper />
    </>
  );
}
