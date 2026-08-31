import { getRayfinClient, isLocalBackend } from './rayfinClient';
import {
  type Priority,
  SAMPLE_REQUESTS,
  type Status,
  type Team,
} from '@/data/sampleData';

/**
 * A service request row. Mirrors the `Requests` entity in
 * `rayfin/data/Requests.ts`. `createdOn` is a `Date` column on the backend, so
 * GraphQL hydrates it back as a `Date` (or ISO string); the service normalizes
 * it to a `YYYY-MM-DD` string so the rest of the app can treat it uniformly.
 */
export interface Request {
  id: string;
  title: string;
  team: Team;
  owner: string;
  priority: Priority;
  status: Status;
  estimateHours: number;
  createdOn: string;
}

/** Fields the user edits — no server-generated `id`. */
export type RequestDraft = Omit<Request, 'id'>;

const SELECT = [
  'id',
  'title',
  'team',
  'owner',
  'priority',
  'status',
  'estimateHours',
  'createdOn',
] as const;

/**
 * Normalize a `createdOn` value to a `YYYY-MM-DD` string. The backend stores it
 * as a Date, so GraphQL may hydrate it as a `Date` or an ISO datetime string.
 * The app relies on a plain date string for `<input type="date">` and sorting.
 */
export function toDateString(value: unknown): string {
  if (value instanceof Date) {
    const y = value.getUTCFullYear();
    const m = String(value.getUTCMonth() + 1).padStart(2, '0');
    const d = String(value.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return String(value).slice(0, 10);
}

// ---------------------------------------------------------------------------
// Local-dev in-memory store.
//
// With no Fabric backend configured (localhost API URL and no `rayfin up`
// database), keep records in memory so the CRUD flows are fully usable without
// SQL — the same convention as the Rayfin todo-app template. Seeded lazily from
// the bundled sample data so the first paint is never empty.
// ---------------------------------------------------------------------------

let inMemory: Request[] | null = null;
let localSeq = 0;

function seedInMemory(): Request[] {
  if (inMemory) return inMemory;
  inMemory = SAMPLE_REQUESTS.map((r) => ({ id: `local-${localSeq++}`, ...r }));
  return inMemory;
}

function sortByCreatedDesc(rows: Request[]): Request[] {
  return [...rows].sort((a, b) => b.createdOn.localeCompare(a.createdOn));
}

export async function getRequests(): Promise<Request[]> {
  if (isLocalBackend()) {
    return sortByCreatedDesc(seedInMemory());
  }

  const client = getRayfinClient();
  const rows = await client.data.Requests.select([...SELECT])
    .orderBy({ createdOn: 'desc' })
    .execute();
  return (rows as unknown as Request[]).map((row) => ({
    ...row,
    createdOn: toDateString(row.createdOn),
  }));
}

export async function createRequest(draft: RequestDraft): Promise<Request> {
  if (isLocalBackend()) {
    const store = seedInMemory();
    const created: Request = { id: `local-${localSeq++}`, ...draft };
    store.push(created);
    return created;
  }

  const client = getRayfinClient();
  const created = (await client.data.Requests.create({
    ...draft,
    createdOn: new Date(draft.createdOn),
  })) as unknown as Request;
  return { ...created, createdOn: toDateString(created.createdOn) };
}

export async function updateRequest(
  id: string,
  draft: RequestDraft
): Promise<Request> {
  if (isLocalBackend()) {
    const store = seedInMemory();
    const idx = store.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error(`Request ${id} not found.`);
    store[idx] = { id, ...draft };
    return store[idx];
  }

  const client = getRayfinClient();
  const updated = (await client.data.Requests.update(
    { id },
    { ...draft, createdOn: new Date(draft.createdOn) }
  )) as unknown as Request;
  return { ...updated, createdOn: toDateString(updated.createdOn) };
}

export async function deleteRequest(id: string): Promise<void> {
  if (isLocalBackend()) {
    const store = seedInMemory();
    const idx = store.findIndex((r) => r.id === id);
    if (idx !== -1) store.splice(idx, 1);
    return;
  }

  const client = getRayfinClient();
  await client.data.Requests.delete({ id });
}

/**
 * Insert every sample request on a real backend. Used only by the one-time
 * database seeder to make a fresh database non-empty.
 */
export async function createSampleRequests(): Promise<void> {
  const client = getRayfinClient();
  for (const r of SAMPLE_REQUESTS) {
    await client.data.Requests.create({
      ...r,
      createdOn: new Date(r.createdOn),
    });
  }
}
