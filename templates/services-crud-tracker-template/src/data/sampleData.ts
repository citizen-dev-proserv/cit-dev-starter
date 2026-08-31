/**
 * Seed data for the Contoso Services Request Tracker.
 *
 * Unlike the read-only analytics dashboard, this template writes back to a
 * real SQL backend. These rows are used two ways:
 *
 * - **Real backend:** inserted once by the seeder (`ensureSeeded`) so a fresh
 *   database is never empty. After that, the app's create/edit/delete flows
 *   are the source of truth.
 * - **Local (no backend):** the `requests` service keeps an in-memory copy
 *   seeded from this list, so the UI is fully interactive without a database.
 *
 * The shape mirrors the `Requests` entity in `rayfin/data/Requests.ts`, minus
 * the server-generated `id`.
 */

export const TEAMS = ['RTS', 'CPI', 'DAI', 'PES', 'TAX'] as const;
export const PRIORITIES = ['Low', 'Medium', 'High'] as const;
export const STATUSES = ['Open', 'In Progress', 'Done'] as const;

export type Team = (typeof TEAMS)[number];
export type Priority = (typeof PRIORITIES)[number];
export type Status = (typeof STATUSES)[number];

/** A request as authored — no server-generated `id`. */
export interface RequestSeed {
  title: string;
  team: Team;
  owner: string;
  priority: Priority;
  status: Status;
  estimateHours: number;
  /** ISO date (YYYY-MM-DD) the request was logged. */
  createdOn: string;
}

export const SAMPLE_REQUESTS: RequestSeed[] = [
  {
    title: 'Stand up creditor reporting workspace',
    team: 'RTS',
    owner: 'Dana Whitfield',
    priority: 'High',
    status: 'In Progress',
    estimateHours: 48,
    createdOn: '2025-05-04',
  },
  {
    title: 'Cost-takeout model for retail client',
    team: 'CPI',
    owner: 'Marcus Lindqvist',
    priority: 'High',
    status: 'Open',
    estimateHours: 72,
    createdOn: '2025-05-11',
  },
  {
    title: 'E-discovery data intake review',
    team: 'DAI',
    owner: 'Priya Nair',
    priority: 'Medium',
    status: 'Open',
    estimateHours: 30,
    createdOn: '2025-05-18',
  },
  {
    title: 'Portfolio company 100-day plan',
    team: 'PES',
    owner: 'Sofia Ricci',
    priority: 'High',
    status: 'In Progress',
    estimateHours: 60,
    createdOn: '2025-05-22',
  },
  {
    title: 'Transfer-pricing documentation refresh',
    team: 'TAX',
    owner: 'Kenji Watanabe',
    priority: 'Low',
    status: 'Done',
    estimateHours: 24,
    createdOn: '2025-04-30',
  },
  {
    title: '13-week cash flow forecast',
    team: 'RTS',
    owner: 'Dana Whitfield',
    priority: 'Medium',
    status: 'Done',
    estimateHours: 36,
    createdOn: '2025-04-15',
  },
  {
    title: 'Procurement spend analytics',
    team: 'CPI',
    owner: 'Marcus Lindqvist',
    priority: 'Medium',
    status: 'In Progress',
    estimateHours: 40,
    createdOn: '2025-05-27',
  },
  {
    title: 'Expert witness report drafting',
    team: 'DAI',
    owner: 'Priya Nair',
    priority: 'High',
    status: 'Open',
    estimateHours: 52,
    createdOn: '2025-06-02',
  },
];
