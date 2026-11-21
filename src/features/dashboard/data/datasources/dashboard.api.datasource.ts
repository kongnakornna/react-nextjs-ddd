import { notAvailable } from '@/src/core/http/api-client';
import type { GenerateDashboardReportParams } from '../../domain/entities/report.entity';
import type {
  DashboardStatsResponseDto,
  JobStatusSummaryResponseDto,
  RevenueDataResponseDto,
  TopPartDataResponseDto,
} from '../dtos/dashboard-stats-response.dto';
import type { ReportResponseDto } from '../dtos/report-response.dto';

/** icmonangular `API_ENDPOINTS.dashboard` (relative to `/api/v1`). */
export const DASHBOARD_ENDPOINTS = {
  stats: '/dashboard/stats',
  revenue: '/dashboard/revenue',
  jobStatus: '/dashboard/job-status',
  topParts: '/dashboard/top-parts',
  reportsList: '/reports',
  exportReport: '/reports/export',
} as const;

/**
 * Port of icmonangular DashboardApiDataSource.
 *
 * FastAPI (fastapiiot, :8000) has none of these routes yet → every method
 * throws ApiNotAvailableError and the pages show <ApiUnavailable/>.
 * When the backend adds one, replace its body with e.g.
 *   `return api.get<DashboardStatsResponseDto>(`${API_PREFIX}${DASHBOARD_ENDPOINTS.stats}`);`
 */
export class DashboardApiDataSource {
  async getStats(): Promise<DashboardStatsResponseDto> {
    return notAvailable('dashboard', `GET ${DASHBOARD_ENDPOINTS.stats}`);
  }

  async getRevenueChart(period: string): Promise<RevenueDataResponseDto[]> {
    return notAvailable(
      'dashboard',
      `GET ${DASHBOARD_ENDPOINTS.revenue}?period=${period}`
    );
  }

  async getJobStatus(): Promise<JobStatusSummaryResponseDto[]> {
    return notAvailable('dashboard', `GET ${DASHBOARD_ENDPOINTS.jobStatus}`);
  }

  async getTopParts(limit?: number): Promise<TopPartDataResponseDto[]> {
    return notAvailable(
      'dashboard',
      `GET ${DASHBOARD_ENDPOINTS.topParts}${limit ? `?limit=${limit}` : ''}`
    );
  }

  async getReports(): Promise<ReportResponseDto[]> {
    return notAvailable('dashboard', `GET ${DASHBOARD_ENDPOINTS.reportsList}`);
  }

  async generateReport(params: GenerateDashboardReportParams): Promise<Blob> {
    return notAvailable(
      'dashboard',
      `GET ${DASHBOARD_ENDPOINTS.exportReport}?type=${params.type}&startDate=${params.startDate}&endDate=${params.endDate}`
    );
  }
}
