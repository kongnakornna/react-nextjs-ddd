import { IotDashboardLayout } from '@/app/_components/layout/iotdashboard';

// "iotdashboard" template (webiot templatevertical4.php) — full-width, no navbar menu.
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <IotDashboardLayout home="/monitoring/smarthome">
      {children}
    </IotDashboardLayout>
  );
}
