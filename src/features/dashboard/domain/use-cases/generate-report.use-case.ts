import type { GenerateDashboardReportParams } from '../entities/report.entity';
import type { IDashboardRepository } from '../repositories/dashboard.repository';

export class GenerateReportUseCase {
  constructor(private repo: IDashboardRepository) {}

  execute(params: GenerateDashboardReportParams): Promise<Blob> {
    return this.repo.generateReport(params);
  }
}
