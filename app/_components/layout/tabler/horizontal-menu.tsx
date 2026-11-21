'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { HORIZONTAL_MENU, type NavItem } from '@/src/core/config/nav-menu.config';
import { useI18n } from '@/src/core/services/i18n.service';
import { NavIcon } from './nav-icon';
import { useDropdown } from './use-dropdown';

/** Port of the Angular header's "Horizontal Menu" (up to 3 levels). */
export function HorizontalMenu({ open, onNavigate }: { open: boolean; onNavigate: () => void }) {
  const pathname = usePathname();
  const { t } = useI18n();
  const label = (item: NavItem) => tr(t, item);

  return (
    <div className="navbar-expand-md">
      <div className={`collapse navbar-collapse${open ? ' show' : ''}`} id="navbar-menu">
        <div className="navbar">
          <div className="container-xl">
            <div className="row flex-column flex-md-row flex-fill align-items-center">
              <div className="col">
                <nav aria-label="Primary">
                  <ul className="navbar-nav">
                    {HORIZONTAL_MENU.map((item) =>
                      item.children ? (
                        <TopDropdown key={item.labelKey + item.href} item={item} pathname={pathname} label={label} onNavigate={onNavigate} />
                      ) : (
                        <li key={item.labelKey + item.href} className={`nav-item${isActive(pathname, item) ? ' active' : ''}`}>
                          <Link className="nav-link" href={item.href ?? '#'} onClick={onNavigate}>
                            <span className="nav-link-icon d-md-none d-lg-inline-block">
                              <NavIcon name={item.icon} className="icon icon-sm" />
                            </span>
                            <span className="nav-link-title">{label(item)}</span>
                          </Link>
                        </li>
                      ),
                    )}
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TopDropdown({
  item,
  pathname,
  label,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  label: (i: NavItem) => string;
  onNavigate: () => void;
}) {
  const dd = useDropdown<HTMLLIElement>();
  // Close when the route changes (link inside the menu was followed).
  useEffect(() => dd.close(), [pathname, dd.close]); // eslint-disable-line react-hooks/exhaustive-deps

  const active = isActive(pathname, item);

  return (
    <li ref={dd.ref} className={`nav-item dropdown${active ? ' active' : ''}`}>
      <a
        className={`nav-link dropdown-toggle${dd.open ? ' show' : ''}`}
        href="#"
        role="button"
        aria-haspopup="true"
        aria-expanded={dd.open}
        onClick={(e) => {
          e.preventDefault();
          dd.toggle();
        }}
      >
        <span className="nav-link-icon d-md-none d-lg-inline-block">
          <NavIcon name={item.icon} className="icon icon-sm" />
        </span>
        <span className="nav-link-title">{label(item)}</span>
      </a>
      <div className={`dropdown-menu${dd.open ? ' show' : ''}`} data-bs-popper="static" onClick={dd.onMenuClick}>
        {item.children!.map((child) =>
          child.children ? (
            <SubMenu key={child.labelKey + child.label} item={child} pathname={pathname} label={label} onNavigate={onNavigate} />
          ) : (
            <MenuLink key={child.labelKey + child.href} item={child} pathname={pathname} label={label} onNavigate={onNavigate} />
          ),
        )}
      </div>
    </li>
  );
}

/** Level-2 item with children → `.dropdown-submenu` (opens on hover via CSS, or tap). */
function SubMenu({
  item,
  pathname,
  label,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  label: (i: NavItem) => string;
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`dropdown-submenu${open ? ' open' : ''}`}>
      <a
        className={`dropdown-item dropdown-toggle${isActive(pathname, item) ? ' active' : ''}`}
        href="#"
        role="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
      >
        <NavIcon name={item.icon} className="icon icon-inline me-1" />
        {label(item)}
      </a>
      <div className="dropdown-menu">
        {item.children!.map((c) => (
          <MenuLink key={c.labelKey + c.href} item={c} pathname={pathname} label={label} onNavigate={onNavigate} />
        ))}
      </div>
    </div>
  );
}

function MenuLink({
  item,
  pathname,
  label,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  label: (i: NavItem) => string;
  onNavigate: () => void;
}) {
  return (
    <Link className={`dropdown-item${pathname === item.href ? ' active' : ''}`} href={item.href ?? '#'} onClick={onNavigate}>
      <NavIcon name={item.icon} className="icon icon-inline me-1" />
      {label(item)}
    </Link>
  );
}

function isActive(pathname: string, item: NavItem): boolean {
  if (item.href && (pathname === item.href || pathname.startsWith(item.href + '/'))) return true;
  return item.children?.some((c) => isActive(pathname, c)) ?? false;
}

/** Translate `labelKey`; fall back to `label` when the key is missing (t returns the key). */
export function tr(t: (k: string) => string, item: { labelKey: string; label: string }): string {
  if (!item.labelKey) return item.label;
  const v = t(item.labelKey);
  return v && v !== item.labelKey ? v : item.label;
}
