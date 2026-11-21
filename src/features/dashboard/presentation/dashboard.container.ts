import { DashboardApiDataSource } from '../data/datasources/dashboard.api.datasource';
import { DashboardRepositoryImpl } from '../data/repositories/dashboard.repository.impl';
import { GenerateReportUseCase } from '../domain/use-cases/generate-report.use-case';
import { GetDashboardStatsUseCase } from '../domain/use-cases/get-dashboard-stats.use-case';
import { GetJobStatusUseCase } from '../domain/use-cases/get-job-status.use-case';
import { GetReportsUseCase } from '../domain/use-cases/get-reports.use-case';
import { GetRevenueChartUseCase } from '../domain/use-cases/get-revenue-chart.use-case';
import { GetTopPartsUseCase } from '../domain/use-cases/get-top-parts.use-case';

/** Wiring for the dashboard feature (Angular: DASHBOARD_REPOSITORY token + providers). */
const repository = new DashboardRepositoryImpl(new DashboardApiDataSource());

export const dashboard = {
  repository,
  getStats: new GetDashboardStatsUseCase(repository),
  getRevenueChart: new GetRevenueChartUseCase(repository),
  getJobStatus: new GetJobStatusUseCase(repository),
  getTopParts: new GetTopPartsUseCase(repository),
  getReports: new GetReportsUseCase(repository),
  generateReport: new GenerateReportUseCase(repository),
};
