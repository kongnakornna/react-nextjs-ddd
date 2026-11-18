'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/app/_components/utils';
import { MENU_CONFIG } from '@/src/core/config/menu.config';
import type { MenuItem } from '@/src/core/config/menu.config';
import {
  LayoutDashboard, Users, FileText, ShoppingCart, Package, CreditCard,
  Folder, Mail, Layers, Cpu, Monitor, Radio, Workflow, ClipboardList,
  Briefcase, Eye, Home, Building2, Activity, Factory, Sun,
  BarChart3, Bot, UserCog, Settings, ChevronDown, X, Menu,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, Users, FileText, ShoppingCart, Package, CreditCard,
  Folder, Mail, Layers, Cpu, Monitor, Radio, Workflow, ClipboardList,
  Briefcase, Eye, Home, Building2, Activity, Factory, Sun,
  BarChart3, Bot, UserCog, Settings,
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

  const toggleSubmenu = (id: string) => {
    setExpandedMenus((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isChildActive = (item: MenuItem): boolean => {
    if (item.href && pathname.startsWith(item.href)) return true;
    return item.children?.some(isChildActive) ?? false;
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-200 ease-in-out lg:translate-x-0 overflow-y-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
          <Link href="/dashboard" className="text-xl font-bold text-gray-900 dark:text-white">
            ICMon
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-3 space-y-0.5">
          {MENU_CONFIG.map((item) => (
            <SidebarItem
              key={item.id}
              item={item}
              pathname={pathname}
              expandedMenus={expandedMenus}
              toggleSubmenu={toggleSubmenu}
              isChildActive={isChildActive}
              onClose={onClose}
            />
          ))}
        </nav>
      </aside>
    </>
  );
}

function SidebarItem({
  item,
  pathname,
  expandedMenus,
  toggleSubmenu,
  isChildActive,
  onClose,
}: {
  item: MenuItem;
  pathname: string;
  expandedMenus: Set<string>;
  toggleSubmenu: (id: string) => void;
  isChildActive: (item: MenuItem) => boolean;
  onClose: () => void;
}) {
  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.href ? pathname.startsWith(item.href) : false;
  const active = isActive || isChildActive(item);
  const expanded = expandedMenus.has(item.id) || active;
  const Icon = item.icon ? ICON_MAP[item.icon] : null;

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => toggleSubmenu(item.id)}
          className={cn(
            'flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors',
            active
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
          )}
        >
          {Icon && <Icon className="w-4 h-4 mr-3 flex-shrink-0" />}
          <span className="flex-1 text-left">{item.label}</span>
          <ChevronDown
            className={cn(
              'w-4 h-4 transition-transform',
              expanded && 'rotate-180'
            )}
          />
        </button>
        {expanded && (
          <div className="ml-4 mt-0.5 space-y-0.5 border-l border-gray-200 dark:border-gray-700 pl-3">
            {item.children!.map((child) => (
              <SidebarItem
                key={child.id}
                item={child}
                pathname={pathname}
                expandedMenus={expandedMenus}
                toggleSubmenu={toggleSubmenu}
                isChildActive={isChildActive}
                onClose={onClose}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href || '#'}
      onClick={onClose}
      className={cn(
        'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
        isActive
          ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
      )}
    >
      {Icon && <Icon className="w-4 h-4 mr-3 flex-shrink-0" />}
      <span>{item.label}</span>
    </Link>
  );
}
