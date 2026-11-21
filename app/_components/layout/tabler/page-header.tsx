'use client';

import type { ReactNode } from 'react';

import { useI18n } from '@/src/core/services/i18n.service';
import { NavIcon } from './nav-icon';

interface PageHeaderProps {
  /** i18n key or plain text */
  title: string;
  pretitle?: string;
  description?: string;
  /** lucide icon name, see nav-icon.tsx */
  icon?: string;
  /** buttons on the right (Angular: `<ng-content select="[actions]">`) */
  actions?: ReactNode;
  className?: string;
}

/**
 * Port of icmonangular `layouts/page-header`. Use at the top of a page:
 *
 *   <PageHeader pretitle="nav.settings" title="nav.devices" actions={<button className="btn btn-primary">Add</button>} />
 *
 * It renders inside the layout's `.container-xl`, so it has no container of its own.
 */
export function PageHeader({ title, pretitle, description, icon, actions, className = '' }: PageHeaderProps) {
  const { t } = useI18n();
  return (
    <div className={`page-header d-print-none mb-3 ${className}`.trim()}>
      <div className="row g-2 align-items-center">
        <div className="col">
          {pretitle && <div className="page-pretitle">{t(pretitle)}</div>}
          <h1 className="page-title">
            {icon && <NavIcon name={icon} className="icon me-2" />}
            {t(title)}
          </h1>
          {description && <div className="text-secondary mt-1">{t(description)}</div>}
        </div>
        {actions && <div className="col-auto ms-auto d-print-none">{actions}</div>}
      </div>
    </div>
  );
}
