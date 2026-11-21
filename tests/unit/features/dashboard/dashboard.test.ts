import { describe, expect, it, vi } from 'vitest';

import { isApiNotAvailable } from '@/src/core/http/api-client';
import { DashboardApiDataSource } from '@/src/features/dashboard/data/datasources/dashboard.api.datasource';
import { DashboardRepositoryImpl } from '@/src/features/dashboard/data/repositories/dashboard.repository.impl';
import {
  canDownloadReport,
  jobStatusBadge,
  jobStatusLabel,
  jobStatusPercent,
  normalizeReportStatus,
  onlineRate,
  partPercent,
  revenueBarHeight,
  totalRevenue,
} from '@/src/features/dashboard/domain/services/dashboard-metrics';
import { GetTopPartsUseCase } from '@/src/features/dashboard/domain/use-cases/get-top-parts.use-case';

const ds = (over: Partial<Record<keyof DashboardApiDataSource, unknown>>) =>
  over as unknown as DashboardApiDataSource;

describe('dashboard-metrics (ported from MainDashboardComponent)', () => {
  it('onlineRate', () => {
    expect(
      onlineRate({
        totalDevices: 8,
        onlineDevices: 6,
        activeAlerts: 0,
        todayCommands: 0,
      })
    ).toBe(75);
    expect(
      onlineRate({
        totalDevices: 0,
        onlineDevices: 0,
        activeAlerts: 0,
        todayCommands: 0,
      })
    ).toBe(0);
  });

  it('revenue helpers', () => {
    const data = [
      { period: 'Jan', amount: 50 },
      { period: 'Feb', amount: 100 },
    ];
    expect(revenueBarHeight(50, data)).toBe(50);
    expect(revenueBarHeight(0, [])).toBe(0);
    expect(totalRevenue(data)).toBe(150);
  });

  it('job status label / badge / percent', () => {
    expect(jobStatusLabel('in_progress')).toBe('jobCard.inProgress');
    expect(jobStatusLabel('failed')).toBe('dashboard.failed');
    expect(jobStatusBadge('running')).toBe('bg-blue');
    expect(jobStatusBadge('other')).toBe('bg-secondary');
    expect(
      jobStatusPercent(1, [
        { status: 'a', count: 1 },
        { status: 'b', count: 3 },
      ])
    ).toBe(25);
    expect(jobStatusPercent(0, [])).toBe(0);
  });

  it('part percent is relative to the max', () => {
    expect(
      partPercent(5, [
        { partName: 'a', count: 10 },
        { partName: 'b', count: 5 },
      ])
    ).toBe(50);
  });

  it('report status', () => {
    expect(normalizeReportStatus('พร้อม')).toBe('ready');
    expect(normalizeReportStatus('กำลังสร้าง')).toBe('generating');
    expect(canDownloadReport('ready')).toBe(true);
    expect(canDownloadReport('generating')).toBe(false);
  });
});

describe('DashboardRepositoryImpl', () => {
  it('maps stats and tolerates missing fields', async () => {
    const repo = new DashboardRepositoryImpl(
      ds({ getStats: vi.fn().mockResolvedValue({ totalDevices: '4' }) })
    );
    expect(await repo.getStats()).toEqual({
      totalDevices: 4,
      onlineDevices: 0,
      activeAlerts: 0,
      todayCommands: 0,
    });
  });

  it('returns [] when a list endpoint returns a non-array', async () => {
    const repo = new DashboardRepositoryImpl(
      ds({
        getRevenueChart: vi.fn().mockResolvedValue({ detail: 'Not Found' }),
        getJobStatus: vi.fn().mockResolvedValue(null),
      })
    );
    expect(await repo.getRevenueChart('monthly')).toEqual([]);
    expect(await repo.getJobStatus()).toEqual([]);
  });

  it('normalizes Thai report statuses', async () => {
    const repo = new DashboardRepositoryImpl(
      ds({
        getReports: vi.fn().mockResolvedValue([
          {
            id: 1,
            name: 'R',
            type: 'pdf',
            createdAt: '2026-01-01',
            status: 'พร้อม',
            reportType: 'sales',
          },
        ]),
      })
    );
    expect((await repo.getReports())[0]).toMatchObject({
      id: '1',
      status: 'ready',
    });
  });

  it('passes the limit through the use case', async () => {
    const getTopParts = vi
      .fn()
      .mockResolvedValue([{ partName: 'Fan', count: 3 }]);
    const uc = new GetTopPartsUseCase(
      new DashboardRepositoryImpl(ds({ getTopParts }))
    );
    expect(await uc.execute(5)).toEqual([{ partName: 'Fan', count: 3 }]);
    expect(getTopParts).toHaveBeenCalledWith(5);
  });
});

describe('DashboardApiDataSource', () => {
  it('reports endpoints missing on FastAPI as ApiNotAvailable', async () => {
    const d = new DashboardApiDataSource();
    for (const call of [
      () => d.getStats(),
      () => d.getRevenueChart('monthly'),
      () => d.getTopParts(5),
      () => d.getReports(),
    ]) {
      const err = await call().catch((e) => e);
      expect(isApiNotAvailable(err)).toBe(true);
    }
  });
});
