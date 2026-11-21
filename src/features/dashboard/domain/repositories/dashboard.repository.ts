import type {
  DashboardStats,
  JobStatusSummary,
  RevenueData,
  TopPartData,
} from '../entities/dashboard-stats.entity';
import type {
  GenerateDashboardReportParams,
  DashboardReport,
} from '../entities/report.entity';

/** Port of icmonangular IDashboardRepository (Observable → Promise). */
export interface IDashboardRepository {
  getStats(): Promise<DashboardStats>;
  getRevenueChart(period: string): Promise<RevenueData[]>;
  getJobStatus(): Promise<JobStatusSummary[]>;
  getTopParts(limit?: number): Promise<TopPartData[]>;
  getReports(): Promise<DashboardReport[]>;
  generateReport(params: GenerateDashboardReportParams): Promise<Blob>;
}
