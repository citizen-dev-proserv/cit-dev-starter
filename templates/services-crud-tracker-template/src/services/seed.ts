import { createSampleRequests, getRequests } from './requests';
import { isLocalBackend } from './rayfinClient';

/**
 * Ensure the app has data to show.
 *
 * - **Local backend:** no-op. The `requests` service keeps an in-memory store
 *   that seeds itself lazily from the bundled sample data.
 * - **Real backend:** if no requests exist yet, insert the full sample set so
 *   a fresh SQL database is never empty. Idempotent — a backend that already
 *   has rows is left untouched.
 */
export async function ensureSeeded(): Promise<void> {
  if (isLocalBackend()) return;

  const existing = await getRequests();
  if (existing.length > 0) return;

  await createSampleRequests();
}

export { getRequests };
