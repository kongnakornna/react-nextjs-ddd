import type {
  DashboardStats,
  JobStatusSummary,
  RevenueData,
  TopPartData,
} from '../../domain/entities/dashboard-stats.entity';
import type {
  GenerateDashboardReportParams,
  DashboardReport,
} from '../../domain/entities/report.entity';
import type { IDashboardRepository } from '../../domain/repositories/dashboard.repository';
import { normalizeReportStatus } from '../../domain/services/dashboard-metrics';
import type { DashboardApiDataSource } from '../datasources/dashboard.api.datasource';

const list = <T>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
const num = (v: unknown): number =>
  Number.isFinite(Number(v)) ? Number(v) : 0;

/** Port of icmonangular DashboardRepositoryImpl (DTO → entity, defensive against bad payloads). */
export class DashboardRepositoryImpl implements IDashboardRepository {
  constructor(private ds: DashboardApiDataSource) {}

  async getStats(): Promise<DashboardStats> {
    const d = (await this.ds.getStats()) ?? ({} as Partial<DashboardStats>);
    return {
      totalDevices: num(d.totalDevices),
      onlineDevices: num(d.onlineDevices),
      activeAlerts: num(d.activeAlerts),
      todayCommands: num(d.todayCommands),
    };
  }

  async getRevenueChart(period: string): Promise<RevenueData[]> {
    return list<RevenueData>(await this.ds.getRevenueChart(period)).map(
      (d) => ({
        period: String(d.period ?? ''),
        amount: num(d.amount),
      })
    );
  }

  async getJobStatus(): Promise<JobStatusSummary[]> {
    return list<JobStatusSummary>(await this.ds.getJobStatus()).map((d) => ({
      status: String(d.status ?? ''),
      count: num(d.count),
    }));
  }

  async getTopParts(limit?: number): Promise<TopPartData[]> {
    return list<TopPartData>(await this.ds.getTopParts(limit)).map((d) => ({
      partName: String(d.partName ?? ''),
      count: num(d.count),
    }));
  }

  async getReports(): Promise<DashboardReport[]> {
    return list<DashboardReport>(await this.ds.getReports()).map((d) => ({
      id: String(d.id),
      name: d.name,
      type: d.type,
      createdAt: d.createdAt,
      status: normalizeReportStatus(d.status),
      reportType: d.reportType,
    }));
  }

  generateReport(params: GenerateDashboardReportParams): Promise<Blob> {
    return this.ds.generateReport(params);
  }
}
