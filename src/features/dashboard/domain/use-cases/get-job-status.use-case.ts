import type { JobStatusSummary } from '../entities/dashboard-stats.entity';
import type { IDashboardRepository } from '../repositories/dashboard.repository';

export class GetJobStatusUseCase {
  constructor(private repo: IDashboardRepository) {}

  execute(): Promise<JobStatusSummary[]> {
    return this.repo.getJobStatus();
  }
}
