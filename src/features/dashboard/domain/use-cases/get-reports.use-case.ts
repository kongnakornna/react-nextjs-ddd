import type { DashboardReport } from '../entities/report.entity';
import type { IDashboardRepository } from '../repositories/dashboard.repository';

export class GetReportsUseCase {
  constructor(private repo: IDashboardRepository) {}

  execute(): Promise<DashboardReport[]> {
    return this.repo.getReports();
  }
}
