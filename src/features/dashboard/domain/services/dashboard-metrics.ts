import type {
  DashboardStats,
  JobStatusSummary,
  RevenueData,
  TopPartData,
} from '../entities/dashboard-stats.entity';
import type { DashboardReportStatus } from '../entities/report.entity';

/**
 * Pure helpers — moved out of the Angular MainDashboardComponent /
 * ReportsComponent so they can be unit-tested without React.
 */

export function onlineRate(stats: DashboardStats): number {
  if (!stats.totalDevices) return 0;
  return Math.round((stats.onlineDevices / stats.totalDevices) * 100);
}

export function revenueBarHeight(amount: number, data: RevenueData[]): number {
  const max = Math.max(...data.map((d) => d.amount), 1);
  return (amount / max) * 100;
}

export function totalRevenue(data: RevenueData[]): number {
  return data.reduce((sum, d) => sum + d.amount, 0);
}

/** i18n key for a job status. */
export function jobStatusLabel(status: string): string {
  if (status === 'pending') return 'jobCard.pending';
  if (status === 'running' || status === 'in_progress')
    return 'jobCard.inProgress';
  if (status === 'completed') return 'jobCard.completed';
  if (status === 'failed') return 'dashboard.failed';
  return status;
}

export function jobStatusBadge(status: string): string {
  if (status === 'pending') return 'bg-yellow';
  if (status === 'running' || status === 'in_progress') return 'bg-blue';
  if (status === 'completed') return 'bg-green';
  if (status === 'failed') return 'bg-red';
  return 'bg-secondary';
}

export function jobStatusPercent(
  count: number,
  data: JobStatusSummary[]
): number {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  if (!total) return 0;
  return Math.round((count / total) * 100);
}

export function partPercent(count: number, data: TopPartData[]): number {
  const max = Math.max(...data.map((d) => d.count), 1);
  return Math.round((count / max) * 100);
}

/** Thai labels from the backend → canonical status (Angular normalizeStatus). */
export function normalizeReportStatus(status: string): DashboardReportStatus {
  if (status === 'พร้อม') return 'ready';
  if (status === 'กำลังสร้าง') return 'generating';
  return status;
}

export function reportStatusLabel(status: DashboardReportStatus): string {
  if (status === 'ready') return 'reports.ready';
  if (status === 'generating') return 'reports.generating';
  return status;
}

export function reportStatusClass(status: DashboardReportStatus): string {
  if (status === 'ready') return 'bg-green';
  if (status === 'generating') return 'bg-yellow';
  return 'bg-secondary';
}

export function canDownloadReport(status: DashboardReportStatus): boolean {
  return status === 'ready';
}
