import type { RevenueData } from '../entities/dashboard-stats.entity';
import type { IDashboardRepository } from '../repositories/dashboard.repository';

export class GetRevenueChartUseCase {
  constructor(private repo: IDashboardRepository) {}

  /** `period`: e.g. 'monthly' (Angular default). */
  execute(period: string): Promise<RevenueData[]> {
    return this.repo.getRevenueChart(period);
  }
}
