import { STATUSES, TEAMS } from '@/data/sampleData';
import type { Request } from '@/services/requests';

export interface RequestKpis {
  total: number;
  open: number;
  inProgress: number;
  done: number;
  totalEstimateHours: number;
}

export interface GroupCount {
  label: string;
  value: number;
}

/** Headline counts across all requests. */
export function computeKpis(requests: Request[]): RequestKpis {
  const kpis: RequestKpis = {
    total: requests.length,
    open: 0,
    inProgress: 0,
    done: 0,
    totalEstimateHours: 0,
  };
  for (const r of requests) {
    kpis.totalEstimateHours += r.estimateHours;
    if (r.status === 'Open') kpis.open++;
    else if (r.status === 'In Progress') kpis.inProgress++;
    else if (r.status === 'Done') kpis.done++;
  }
  return kpis;
}

/** Count of requests per team, in the canonical team order. */
export function countByTeam(requests: Request[]): GroupCount[] {
  const counts = new Map<string, number>(TEAMS.map((t) => [t, 0]));
  for (const r of requests) {
    counts.set(r.team, (counts.get(r.team) ?? 0) + 1);
  }
  return TEAMS.map((t) => ({ label: t, value: counts.get(t) ?? 0 }));
}

/** Sum of estimate hours per status, in workflow order. */
export function estimateByStatus(requests: Request[]): GroupCount[] {
  const totals = new Map<string, number>(STATUSES.map((s) => [s, 0]));
  for (const r of requests) {
    totals.set(r.status, (totals.get(r.status) ?? 0) + r.estimateHours);
  }
  return STATUSES.map((s) => ({ label: s, value: totals.get(s) ?? 0 }));
}
