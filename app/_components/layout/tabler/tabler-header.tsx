'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Bell, LayoutGrid, Maximize, Minimize, Moon, MoveHorizontal, RectangleHorizontal,
  Settings, SlidersHorizontal, Sun,
} from 'lucide-react';

import { signOutAction } from '@/app/(home)/actions/sign-out.action';
import { LanguageSelector } from '@/app/_components/auth/language-selector';
import { OPEN_THEME_SETTINGS_EVENT } from '@/app/_components/auth/theme-builder';
import { ConfirmModal } from '@/app/_components/shared/confirm-modal';
import { APPS_MENU, DEMO_NOTIFICATIONS, PROFILE_MENU } from '@/src/core/config/nav-menu.config';
import { useI18n } from '@/src/core/services/i18n.service';
import { toggleFullscreen, useTheme } from '@/src/core/services/theme.service';
import { AuthApiDataSource } from '@/src/features/auth/data/datasources/auth.api.datasource';
import { HorizontalMenu, tr } from './horizontal-menu';
import { NavIcon } from './nav-icon';
import { useDropdown } from './use-dropdown';

const DEFAULT_AVATAR = '/img/avatars/avatar1.png';

interface HeaderUser {
  name: string;
  role: string;
}

/** Port of icmonangular `layouts/header/header.component.{ts,html}`. */
export function TablerHeader() {
  const pathname = usePathname();
  const { t } = useI18n();
  const { settings, toggleTheme, update } = useTheme();

  const [menuOpen, setMenuOpen] = useState(false);
  const [unread, setUnread] = useState(DEMO_NOTIFICATIONS.filter((n) => !n.read).length);
  const [user, setUser] = useState<HeaderUser | null>(null);
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const notif = useDropdown({ autoClose: 'outside' });
  const apps = useDropdown();
  const layout = useDropdown({ autoClose: 'outside' });
  const profile = useDropdown();

  const isSettingsPage = pathname.startsWith('/settings');

  // Current user from the backend (GET /api/v1/user/me) — replaces the
  // Angular header's localStorage cache (fullname / roleTitle / avatarUrl).
  useEffect(() => {
    let cancelled = false;
    new AuthApiDataSource()
      .getCurrentUser()
      .then((u) => {
        if (cancelled) return;
        const name = u.fullname || `${u.firstname} ${u.lastname}`.trim() || u.username || u.email;
        setUser({ name, role: u.role_title ?? '' });
      })
      .catch(() => {
        // not signed in to the backend / network error → keep the placeholder
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  const doLogout = async () => {
    setConfirmLogout(false);
    await signOutAction();
  };

  return (
    <>
      <header className="navbar navbar-expand-md d-print-none">
        <div className="container-xl">
          <button
            className="navbar-toggler"
            type="button"
            aria-controls="navbar-menu"
            aria-expanded={menuOpen}
            aria-label={t('layout.header.toggleNav')}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div className="navbar-brand navbar-brand-autodark pe-0 pe-md-3">
            <Link href="/dashboard" aria-label={t('layout.header.home')}>
              <img src="/img/logo/1-logo-light.png" className="navbar-brand-image hide-theme-dark" alt={t('layout.header.logo')} />
              <img src="/img/logo/2-logo-dark.png" className="navbar-brand-image hide-theme-light" alt={t('layout.header.logo')} />
            </Link>
          </div>

          <div className="navbar-nav flex-row order-md-last">
            {/* notifications */}
            <div className="d-none d-md-flex me-3">
              <div ref={notif.ref} className="nav-item dropdown d-none d-md-flex">
                <a
                  href="#"
                  className="nav-link px-0"
                  aria-label={t('layout.header.showNotifications')}
                  aria-expanded={notif.open}
                  onClick={(e) => {
                    e.preventDefault();
                    notif.toggle();
                  }}
                >
                  <Bell className="icon icon-sm" />
                  {unread > 0 && <span className="badge bg-red">{unread}</span>}
                </a>
                <div className={`dropdown-menu dropdown-menu-arrow dropdown-menu-end dropdown-menu-card${notif.open ? ' show' : ''}`} data-bs-popper="static">
                  <div className="card">
                    <div className="card-header d-flex">
                      <h3 className="card-title">{t('layout.header.notifications')}</h3>
                      <button type="button" className="btn-close ms-auto" aria-label={t('layout.header.close')} onClick={notif.close} />
                    </div>
                    <div className="list-group list-group-flush list-group-hoverable">
                      {DEMO_NOTIFICATIONS.map((n) => (
                        <div className="list-group-item" key={n.id}>
                          <div className="row align-items-center">
                            <div className="col-auto">
                              <span className={`status-dot d-block${n.read ? '' : ' status-dot-animated bg-red'}`} />
                            </div>
                            <div className="col text-truncate">
                              <span className="text-body d-block">{t(n.titleKey)}</span>
                              <div className="d-block text-secondary text-truncate mt-n1">{t(n.timeKey)}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col">
                          <button type="button" className="btn btn-outline-secondary w-100" onClick={() => setUnread(0)}>
                            {t('layout.header.archiveAll')}
                          </button>
                        </div>
                        <div className="col">
                          <button type="button" className="btn btn-outline-secondary w-100" onClick={() => setUnread(0)}>
                            {t('layout.header.markAllRead')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* apps */}
            <div ref={apps.ref} className="nav-item dropdown d-none d-md-flex me-3">
              <a
                href="#"
                className="nav-link px-0"
                aria-label={t('layout.header.showApps')}
                aria-expanded={apps.open}
                onClick={(e) => {
                  e.preventDefault();
                  apps.toggle();
                }}
              >
                <LayoutGrid className="icon icon-sm" />
              </a>
              <div
                className={`dropdown-menu dropdown-menu-arrow dropdown-menu-end dropdown-menu-card${apps.open ? ' show' : ''}`}
                data-bs-popper="static"
                onClick={apps.onMenuClick}
              >
                <div className="card">
                  <div className="card-header">
                    <div className="card-title">{t('layout.header.apps')}</div>
                  </div>
                  <div className="card-body scroll-y p-2" style={{ maxHeight: '50vh' }}>
                    <div className="row g-0">
                      {APPS_MENU.map((app) => (
                        <div className="col-4" key={app.href}>
                          <Link
                            href={app.href!}
                            className="d-flex flex-column align-items-center justify-content-center text-center text-secondary py-2 px-2 link-hoverable"
                          >
                            <NavIcon name={app.icon} className="icon icon-md mx-auto mb-2" />
                            <span className="h5">{tr(t, app)}</span>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* dark / light toggle — Tabler hides one of the two via data-bs-theme */}
            <div className="nav-item me-3">
              <a
                href="#"
                className="nav-link px-0 hide-theme-dark"
                title={t('layout.header.enableDarkMode')}
                onClick={(e) => {
                  e.preventDefault();
                  toggleTheme();
                }}
              >
                <Moon className="icon" />
              </a>
              <a
                href="#"
                className="nav-link px-0 hide-theme-light"
                title={t('layout.header.enableLightMode')}
                onClick={(e) => {
                  e.preventDefault();
                  toggleTheme();
                }}
              >
                <Sun className="icon" />
              </a>
            </div>

            {/* layout mode: fluid / boxed / boxed-2 / full screen */}
            <div ref={layout.ref} className="nav-item dropdown d-none d-md-flex me-3">
              <a
                href="#"
                className="nav-link px-0 layout-toggle"
                aria-label={t('layout.header.layoutTitle')}
                aria-expanded={layout.open}
                onClick={(e) => {
                  e.preventDefault();
                  layout.toggle();
                }}
              >
                <SlidersHorizontal className="icon" />
              </a>
              <div className={`dropdown-menu dropdown-menu-arrow dropdown-menu-end dropdown-menu-card${layout.open ? ' show' : ''}`} data-bs-popper="static">
                <div className="card">
                  <div className="list-group list-group-flush list-group-hoverable">
                    {(
                      [
                        { mode: 'fluid', Icon: MoveHorizontal, key: 'layout.header.layoutFluid' },
                        { mode: 'boxed', Icon: Minimize, key: 'layout.header.layoutBoxed' },
                        { mode: 'boxed-2', Icon: RectangleHorizontal, key: 'layout.header.layoutBoxed2' },
                      ] as const
                    ).map(({ mode, Icon, key }) => (
                      <div key={mode} className={`list-group-item${settings.layout === mode ? ' active' : ''}`}>
                        <button type="button" className="list-group-item-actions btn btn-link p-0 d-flex align-items-center gap-2" onClick={() => update('layout', mode)}>
                          <Icon className="icon" />
                          {t(key)}
                        </button>
                      </div>
                    ))}
                    <div className="list-group-item">
                      <button type="button" className="list-group-item-actions btn btn-link p-0 d-flex align-items-center gap-2" onClick={toggleFullscreen}>
                        <Maximize className="icon" />
                        {t('layout.header.fullScreen')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* theme settings — only on /settings pages, like the Angular header */}
            {isSettingsPage && (
              <div className="nav-item d-flex me-2 me-md-3">
                <a
                  href="#"
                  className="nav-link px-0"
                  title={t('layout.settings.title')}
                  aria-label={t('layout.settings.title')}
                  onClick={(e) => {
                    e.preventDefault();
                    window.dispatchEvent(new Event(OPEN_THEME_SETTINGS_EVENT));
                  }}
                >
                  <Settings className="icon icon-sm" />
                </a>
              </div>
            )}

            {/* profile */}
            <div ref={profile.ref} className="nav-item dropdown">
              <a
                href="#"
                className="nav-link d-flex lh-1 p-0 px-2"
                data-testid="profile-toggle"
                aria-label={t('layout.header.openUserMenu')}
                aria-expanded={profile.open}
                onClick={(e) => {
                  e.preventDefault();
                  profile.toggle();
                }}
              >
                <img src={avatar} onError={() => setAvatar(DEFAULT_AVATAR)} className="avatar avatar-sm" alt={t('layout.header.userAvatar')} />
                <div className="d-none d-xl-block ps-2 user-info">
                  <div className="user-name text-truncate" title={user?.name}>
                    {user?.name || t('layout.header.userName')}
                  </div>
                  <div className="user-role mt-1 small text-secondary text-truncate" title={user?.role}>
                    {user?.role || t('layout.header.userRole')}
                  </div>
                </div>
              </a>
              <div
                className={`dropdown-menu dropdown-menu-end dropdown-menu-arrow${profile.open ? ' show' : ''}`}
                data-bs-popper="static"
                onClick={profile.onMenuClick}
              >
                {PROFILE_MENU.map((item, i) =>
                  item.divider ? (
                    <div key={`d${i}`} className="dropdown-divider" />
                  ) : item.action === 'logout' ? (
                    <button key={item.labelKey} type="button" className="dropdown-item" onClick={() => setConfirmLogout(true)}>
                      <NavIcon name={item.icon} className="icon dropdown-item-icon" />
                      {tr(t, item)}
                    </button>
                  ) : (
                    <Link key={item.labelKey} href={item.href ?? '#'} className="dropdown-item">
                      <NavIcon name={item.icon} className="icon dropdown-item-icon" />
                      {tr(t, item)}
                    </Link>
                  ),
                )}
              </div>
            </div>

            <div className="nav-item ms-2">
              <LanguageSelector />
            </div>
          </div>
        </div>
      </header>

      <HorizontalMenu open={menuOpen} onNavigate={() => setMenuOpen(false)} />

      <ConfirmModal
        open={confirmLogout}
        title={t('layout.header.signOutConfirmTitle')}
        message={t('layout.header.signOutConfirmMessage')}
        confirmText={t('layout.header.signOutConfirmButton')}
        cancelText={t('common.cancel') !== 'common.cancel' ? t('common.cancel') : 'Cancel'}
        onConfirm={doLogout}
        onCancel={() => setConfirmLogout(false)}
      />
    </>
  );
}
