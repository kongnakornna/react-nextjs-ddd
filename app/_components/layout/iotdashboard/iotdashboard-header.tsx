'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  IconChartAreaLine,
  IconLogout,
  IconMoon,
  IconSettings,
  IconSun,
  IconTemplate,
  IconUserCircle,
} from '@tabler/icons-react';

import { signOutAction } from '@/app/(home)/actions/sign-out.action';
import { LanguageSelector } from '@/app/_components/auth/language-selector';
import { ConfirmModal } from '@/app/_components/shared/confirm-modal';
import { useI18n } from '@/src/core/services/i18n.service';
import { useTheme } from '@/src/core/services/theme.service';
import { tf } from '@/src/core/ui/tf';
import { AuthApiDataSource } from '@/src/features/auth/data/datasources/auth.api.datasource';
import { useDropdown } from '../tabler/use-dropdown';

const DEFAULT_AVATAR = '/img/avatars/avatar1.png';

/** Links of the user dropdown (PHP pagewrapper_dasdboard_iot.php). */
const USER_MENU = [
  {
    label: 'Overview',
    key: 'iotLayout.overview',
    href: '/dashboard',
    Icon: IconTemplate,
  },
  {
    label: 'Profile',
    key: 'iotLayout.profile',
    href: '/user/listdata',
    Icon: IconUserCircle,
  },
  {
    label: 'History log',
    key: 'iotLayout.historyLog',
    href: '/reports/logs-control',
    Icon: IconChartAreaLine,
  },
  { divider: true as const },
  {
    label: 'Settings',
    key: 'iotLayout.settings',
    href: '/settings',
    Icon: IconSettings,
  },
];

/**
 * IoT page header — port of webiot `template/pagewrapper_dasdboard_iot.php`:
 * brand logo (→ home) · language · theme toggle · user dropdown. No navbar menu,
 * so the dashboard canvas gets the full width.
 */
export function IotDashboardHeader({ home = '/dashboard' }: { home?: string }) {
  const { toggleTheme } = useTheme();
  const { t } = useI18n();
  const L = (k: string, f: string) => tf(t, `iotLayout.${k}`, f);
  const profile = useDropdown();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
  const [confirmLogout, setConfirmLogout] = useState(false);

  useEffect(() => {
    let cancelled = false;
    new AuthApiDataSource()
      .getCurrentUser()
      .then((u) => {
        if (cancelled) return;
        const name =
          u.fullname ||
          `${u.firstname} ${u.lastname}`.trim() ||
          u.username ||
          u.email;
        setUser({ name, role: u.role_title ?? '' });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="page-header d-print-none mt-0 py-2">
      <div className="container-fluid">
        <div className="row g-2 align-items-center">
          <div className="col">
            <Link
              href={home}
              className="navbar-brand navbar-brand-autodark pe-0 pe-md-3"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/img/logo/1-logo-light.png"
                className="navbar-brand-image hide-theme-dark"
                alt="iCmon"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/img/logo/2-logo-dark.png"
                className="navbar-brand-image hide-theme-light"
                alt="iCmon"
              />
            </Link>
          </div>

          <div className="col-auto ms-auto d-print-none">
            <div className="btn-list align-items-center">
              <LanguageSelector />

              <button
                type="button"
                className="btn btn-ghost-secondary btn-icon hide-theme-dark"
                onClick={toggleTheme}
                aria-label="Dark mode"
              >
                <IconMoon size={20} />
              </button>
              <button
                type="button"
                className="btn btn-ghost-secondary btn-icon hide-theme-light"
                onClick={toggleTheme}
                aria-label="Light mode"
              >
                <IconSun size={20} />
              </button>

              <div ref={profile.ref} className="nav-item dropdown">
                <a
                  href="#"
                  className="nav-link d-flex lh-1 p-0 px-2"
                  aria-label={L('userMenu', 'Open user menu')}
                  aria-expanded={profile.open}
                  onClick={(e) => {
                    e.preventDefault();
                    profile.toggle();
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={avatar}
                    onError={() => setAvatar(DEFAULT_AVATAR)}
                    className="avatar avatar-sm"
                    alt=""
                  />
                  <div className="d-none d-xl-block ps-2">
                    <div>{user?.name || 'Cmon'}</div>
                    <div className="mt-1 small text-secondary">
                      {user?.role || 'Cmon user'}
                    </div>
                  </div>
                </a>
                <div
                  className={`dropdown-menu dropdown-menu-end dropdown-menu-arrow${profile.open ? ' show' : ''}`}
                  data-bs-popper="static"
                  onClick={profile.onMenuClick}
                >
                  {USER_MENU.map((m, i) =>
                    'divider' in m ? (
                      <div key={`d${i}`} className="dropdown-divider" />
                    ) : (
                      <Link
                        key={m.href}
                        href={m.href}
                        className="dropdown-item"
                      >
                        <m.Icon size={18} className="dropdown-item-icon" />{' '}
                        {tf(t, m.key, m.label)}
                      </Link>
                    )
                  )}
                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => setConfirmLogout(true)}
                  >
                    <IconLogout size={18} className="dropdown-item-icon" />{' '}
                    {L('logout', 'Logout')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={confirmLogout}
        title={L('logout', 'Logout')}
        message={L('logoutConfirm', 'Do you want to sign out?')}
        confirmText={L('logout', 'Logout')}
        cancelText={L('cancel', 'Cancel')}
        onConfirm={async () => {
          setConfirmLogout(false);
          await signOutAction();
        }}
        onCancel={() => setConfirmLogout(false)}
      />
    </div>
  );
}
