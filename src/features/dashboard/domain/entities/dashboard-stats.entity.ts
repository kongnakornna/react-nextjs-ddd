/** Port of icmonangular features/dashboard/domain/entities/dashboard-stats.entity.ts */
export interface DashboardStats {
  totalDevices: number;
  onlineDevices: number;
  activeAlerts: number;
  todayCommands: number;
}

export interface RevenueData {
  period: string;
  amount: number;
}

export interface JobStatusSummary {
  status: string;
  count: number;
}

export interface TopPartData {
  partName: string;
  count: number;
}
