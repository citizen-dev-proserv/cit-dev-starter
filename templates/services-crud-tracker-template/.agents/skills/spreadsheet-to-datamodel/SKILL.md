---
name: spreadsheet-to-datamodel
description: "Use when a user wants to turn a spreadsheet (CSV, XLSX, or macro-enabled XLSM) into a Rayfin SQL data model — inferring entities, columns, types, keys, and relationships, then generating rayfin/data/*.ts and seed data in the services-crud-tracker shape. Triggers: spreadsheet to data model, infer schema from Excel, xlsx to entities, csv to schema, generate Rayfin entities from a workbook, build a data model from a spreadsheet, multi-sheet workbook schema, import spreadsheet, vibe code a schema from data, reverse-engineer schema, @entity from spreadsheet."
metadata:
  author: memasanz
  version: 0.1.0
---
# Spreadsheet → Rayfin data model

Turn a user's spreadsheet into a working Rayfin **MSSQL** data model and a CRUD app,
using this template (`services-crud-tracker`) as the target shape.

**Division of labor — read this first.**

- **Python is deterministic.** `scripts/profile_spreadsheet.py` parses the workbook and
  emits a structured JSON *profile* (sheets, columns, inferred types, keys, relationships).
  It never guesses the final model and never executes macros.
- **You (the agent) do the modeling judgment — the "vibe" step.** You read the profile with
  the user, name the entities/fields, confirm types and relationships, and author the
  Rayfin code. Always confirm entity/field names and relationships with the user before writing files.

## When to use

Use this skill when the user provides (or points at) a `.csv`, `.xlsx`, or `.xlsm` and wants
a SQL-backed app or data model from it. Do **not** use it to *upload data into an
already-deployed app at runtime* — that is a separate feature (a stable schema must already exist).

## Workflow

### 1. Profile the spreadsheet (deterministic)

Install the design-time deps into a throwaway environment (these are **not** app runtime deps):

```bash
pip install -r .agents/skills/spreadsheet-to-datamodel/scripts/requirements.txt
```

Run the profiler. Start with a draft to see a first-cut model:

```bash
python .agents/skills/spreadsheet-to-datamodel/scripts/profile_spreadsheet.py <path-to-file> --draft-entities
```

Useful flags:

- `--json profile.json` — write the profile to a file instead of stdout.
- `--sample-rows N` — rows sampled per sheet for inference (default 200; raise for wide type variety).
- `--draft-entities` — also print a **draft** set of `@entity` classes to react to (not final).

The JSON profile contains, per sheet: `entityName`, `candidateKey`, and for each column a
Rayfin `decorator` (`@int`/`@decimal`/`@date`/`@boolean`/`@email`/`@text`), `nullPct`,
`distinct`, `unique`, `maxLength`, and `sampleValues`. A top-level `relationships` array
proposes `@one` foreign keys where one sheet's column values are a subset of another sheet's key.
A top-level `notes` array flags macro-enabled files.

### 2. Review the profile with the user (the "vibe" step)

Turn the profile into a model you and the user agree on. Decide:

- **Entity names** — profile `entityName` is a PascalCase guess from the sheet name; rename to a
  clean singular noun (e.g. sheet `Requests` → entity `Request`).
- **Types** — sanity-check the inferred decorators against `sampleValues`. Common overrides:
  an `@int` code that is really an identifier/label → `@text`; a numeric column with mixed
  precision → confirm `@decimal` precision/scale; a low-cardinality `@text` that is really an
  enum → keep `@text` but validate allowed values in the app layer (as `Requests.ts` does).
- **Keys** — every Rayfin entity gets its own `@uuid() id`. If the sheet has a natural key
  (`candidateKey`), keep it as a normal unique field; do **not** reuse it as the primary key.
- **Relationships** — confirm each proposed `@one`. `medium` confidence means the join was
  matched on a text code, not an int/uuid — verify it is a real foreign key, not a coincidence.
  Add the inverse `@many` on the parent where it makes sense.
- **Macros (.xlsm)** — never execute VBA. Read it only as a hint about business rules
  (e.g. a computed column) and reflect that logic in the app layer, not the schema.

### 3. Author the Rayfin data model

Write one file per entity under `rayfin/data/`, following the existing `rayfin/data/Requests.ts`
conventions exactly:

- Decorators are lowercase named imports from `@microsoft/rayfin-core`
  (`entity`, `uuid`, `text`, `int`, `decimal`, `boolean`, `date`, `email`, `one`, `many`).
- `@text` needs a `max`; the profiler suggests one from observed lengths.
- Add a short comment on each field describing its meaning (mirror `Requests.ts`).

Then register every entity in `rayfin/data/schema.ts`:

```ts
import { Request } from './Request.js';
import { Team } from './Team.js';

export const schema = [Request, Team];

export type AppSchema = {
  Request: Request;
  Team: Team;
};
```

> **Verify relationship syntax against the Rayfin docs.** The profiler's draft uses
> `@one(() => Target)`, but confirm the exact `@one`/`@many` signature, foreign-key naming,
> and constraint limits with the bundled `rayfin` skill / MCP (`search_docs`, `get_doc`) or
> `rayfin docs` before finalizing — those are the authoritative source.

### 4. Wire the app layer

For each entity, mirror the existing app structure so the CRUD flows and seed keep working:

- `src/data/sampleData.ts` — type unions and a handful of seed rows (from the spreadsheet's
  real rows where possible), matching the entity shape minus `id`.
- `src/services/<entity>.ts` — CRUD + local in-memory fallback, modeled on `src/services/requests.ts`
  (keep the `isLocalBackend()` split and the `toDateString` normalization for `@date` columns).
- `src/services/seed.ts` — extend `ensureSeeded()` to seed the new entities on a fresh backend.
- Pages/components — reuse `RequestsPage.tsx` / `RequestFormModal.tsx` as the pattern for a
  new entity's table + form.

### 5. Validate

Run the template's own gates before handing back:

```bash
npm run lint && npm run test && npm run build
```

Fix type errors from the generated entities (usually `@text` max mismatches or a wrong
decorator import) until all three pass.

## Guardrails

- **Never execute macros.** `.xlsm` VBA is read as documentation only.
- **Don't ship the profiler deps in the app.** `pandas`/`openpyxl` are design-time tools; they
  must not be added to the project `package.json` or `requirements` shipped with the app.
- **Keep the user in the loop.** The profile is a proposal. Confirm names, types, and
  relationships before writing files.
- **One entity per sheet is a starting point, not a rule.** Split or merge sheets where the data
  clearly models a different set of entities.
