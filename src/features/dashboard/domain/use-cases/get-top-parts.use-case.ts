import type { TopPartData } from '../entities/dashboard-stats.entity';
import type { IDashboardRepository } from '../repositories/dashboard.repository';

export class GetTopPartsUseCase {
  constructor(private repo: IDashboardRepository) {}

  execute(limit?: number): Promise<TopPartData[]> {
    return this.repo.getTopParts(limit);
  }
}
