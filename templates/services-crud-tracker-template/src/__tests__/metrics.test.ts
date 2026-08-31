import { describe, expect, it } from 'vitest';

import { toDateString } from '@/services/requests';

/**
 * Guards the `createdOn` normalization contract. The Fabric backend stores
 * `createdOn` as a Date, so GraphQL hydrates it back as a `Date` (or ISO
 * datetime string) — but the UI treats it as a `YYYY-MM-DD` string for
 * `<input type="date">` and for sorting. Without normalization, an
 * `<input type="date">` bound to a Date object renders blank.
 */
describe('createdOn normalization', () => {
  it('normalizes Date and ISO string values to YYYY-MM-DD', () => {
    expect(toDateString(new Date('2025-06-01T00:00:00Z'))).toBe('2025-06-01');
    expect(toDateString('2025-06-01T00:00:00.000Z')).toBe('2025-06-01');
    expect(toDateString('2025-06-01')).toBe('2025-06-01');
  });
});
