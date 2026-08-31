import { describe, expect, it } from 'vitest';

import { SAMPLE_REQUESTS, STATUSES, TEAMS } from '@/data/sampleData';
import type { Request } from '@/services/requests';
import { computeKpis, countByTeam, estimateByStatus } from '@/services/stats';

const requests: Request[] = SAMPLE_REQUESTS.map((r, i) => ({
  id: `r-${i}`,
  ...r,
}));

describe('sample data', () => {
  it('uses only valid teams, priorities, and statuses', () => {
    for (const r of SAMPLE_REQUESTS) {
      expect(TEAMS).toContain(r.team);
      expect(STATUSES).toContain(r.status);
      expect(r.estimateHours).toBeGreaterThan(0);
    }
  });
});

describe('stats helpers', () => {
  it('computes KPI counts that sum to the total', () => {
    const kpis = computeKpis(requests);
    expect(kpis.total).toBe(requests.length);
    expect(kpis.open + kpis.inProgress + kpis.done).toBe(kpis.total);
    expect(kpis.totalEstimateHours).toBe(
      requests.reduce((s, r) => s + r.estimateHours, 0)
    );
  });

  it('returns zeroed KPIs for no data', () => {
    expect(computeKpis([])).toEqual({
      total: 0,
      open: 0,
      inProgress: 0,
      done: 0,
      totalEstimateHours: 0,
    });
  });

  it('counts requests by team in canonical order', () => {
    const byTeam = countByTeam(requests);
    expect(byTeam.map((g) => g.label)).toEqual([...TEAMS]);
    expect(byTeam.reduce((s, g) => s + g.value, 0)).toBe(requests.length);
  });

  it('sums estimate hours by status in workflow order', () => {
    const byStatus = estimateByStatus(requests);
    expect(byStatus.map((g) => g.label)).toEqual([...STATUSES]);
    expect(byStatus.reduce((s, g) => s + g.value, 0)).toBe(
      requests.reduce((s, r) => s + r.estimateHours, 0)
    );
  });
});
