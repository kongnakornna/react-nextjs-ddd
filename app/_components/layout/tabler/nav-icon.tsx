import {
  Activity, AreaChart, BarChart, Bell, Bot, Briefcase, Building2, CalendarClock,
  ClipboardList, Cpu, CreditCard, Database, Factory, FileBarChart, FileText, Folder,
  Home, KeyRound, Layers, LayoutDashboard, List, ListChecks, Lock, LogOut, Mail, Map,
  MapPin, MessageCircle, Monitor, MonitorDot, Package, Pencil, Phone, Plus, Radio,
  Server, Settings, Shield, ShoppingCart, Sparkles, Sun, Thermometer, User, Users,
  Webhook,
  type LucideIcon,
} from 'lucide-react';

/** lucide-react icons referenced by name from src/core/config/nav-menu.config.ts */
const ICONS: Record<string, LucideIcon> = {
  Activity, AreaChart, BarChart, Bell, Bot, Briefcase, Building2, CalendarClock,
  ClipboardList, Cpu, CreditCard, Database, Factory, FileBarChart, FileText, Folder,
  Home, KeyRound, Layers, LayoutDashboard, List, ListChecks, Lock, LogOut, Mail, Map,
  MapPin, MessageCircle, Monitor, MonitorDot, Package, Pencil, Phone, Plus, Radio,
  Server, Settings, Shield, ShoppingCart, Sparkles, Sun, Thermometer, User, Users,
  Webhook,
};

export function NavIcon({ name, className = 'icon' }: { name?: string; className?: string }) {
  const Icon = name ? ICONS[name] : undefined;
  if (!Icon) return null;
  return <Icon className={className} strokeWidth={2} aria-hidden="true" />;
}
