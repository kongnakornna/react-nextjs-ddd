import { TablerLayout } from '@/app/_components/layout/tabler';

// Tabler app shell ported from icmonangular (header + horizontal menu + footer).
// The previous Tailwind sidebar shell is still available as `AppLayout`
// from '@/app/_components/layout'. See docs/themoption.md.
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TablerLayout>{children}</TablerLayout>;
}
