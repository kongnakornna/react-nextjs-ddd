import MonitoringLayout from '@/src/features/monitoring/presentation/layouts/monitoring-layout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <MonitoringLayout>{children}</MonitoringLayout>;
}
