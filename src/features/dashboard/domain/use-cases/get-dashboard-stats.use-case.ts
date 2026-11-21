import type { DashboardStats } from '../entities/dashboard-stats.entity';
import type { IDashboardRepository } from '../repositories/dashboard.repository';

export class GetDashboardStatsUseCase {
  constructor(private repo: IDashboardRepository) {}

  execute(): Promise<DashboardStats> {
    return this.repo.getStats();
  }
}
