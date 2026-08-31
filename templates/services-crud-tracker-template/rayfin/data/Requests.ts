import { date, entity, int, text, uuid } from '@microsoft/rayfin-core';

/**
 * A single service request tracked by a Contoso practice — the one entity in
 * this "SQL write-back" sample. Unlike the read-only analytics dashboard, the
 * UI creates, edits, and deletes these rows, so every column maps to an
 * editable form field.
 *
 * No `@authenticated`/`@role` decorator is applied, so this entity uses
 * Rayfin's **default permissions**: any authenticated caller can read and
 * write (full CRUD). Tighten later with `@authenticated(...)` or `@role(...)`
 * policies — and add `policy: (claims, item) => claims.sub.eq(item.owner_id)`
 * for per-user row-level security.
 */
@entity()
export class Requests {
  @uuid() id!: string;
  // Short summary of the request (the table's primary label).
  @text({ max: 120 }) title!: string;
  // Owning service line / team code (e.g. RTS, CPI, DAI).
  @text({ max: 60 }) team!: string;
  // Person accountable for the request.
  @text({ max: 80 }) owner!: string;
  // Triage priority: "Low" | "Medium" | "High" (validated in the app layer).
  @text({ max: 20 }) priority!: string;
  // Workflow state: "Open" | "In Progress" | "Done" (validated in the app layer).
  @text({ max: 20 }) status!: string;
  // Rough effort estimate in hours.
  @int() estimateHours!: number;
  // Day the request was logged.
  @date() createdOn!: Date;
}
