/** Port of icmonangular features/dashboard/domain/entities/report.entity.ts */
export type DashboardReportStatus = 'ready' | 'generating' | (string & {});

export interface DashboardReport {
  id: string;
  name: string;
  type: string;
  createdAt: string;
  status: DashboardReportStatus;
  reportType: string;
}

export interface GenerateDashboardReportParams {
  type: string;
  startDate: string;
  endDate: string;
}
