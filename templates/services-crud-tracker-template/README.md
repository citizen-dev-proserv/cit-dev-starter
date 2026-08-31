# Contoso Services Request Tracker

A Fabric-authenticated **CRUD** app for a professional-services firm ("Contoso"), built on
[Project Rayfin](https://github.com/microsoft/awesome-rayfin). It lets you **create, edit, and
delete service requests** — every change is written back to a Rayfin **MSSQL** backend and
reflected live in the KPIs and charts. It shares the corporate "Contoso" design system with the
read-only analytics dashboard, but this is the **write-back** sibling: a minimal, single-entity
example of persisting data to SQL.

- **Auth** — Microsoft Fabric SSO in production, mock email/password locally.
- **Data** — one `Requests` entity via Rayfin's typed data client, with full create/read/update/delete.
- **Local fallback** — with no backend configured, records live in an in-memory store seeded from
  the bundled sample data, so the CRUD flows are fully usable without SQL.
- **Design system** — deep-navy / accent-blue / amber tokens, square geometry, condensed display
  type. Reskin the whole app from one CSS file.
- **Charts** — D3 horizontal bar charts for requests-by-team and estimate-hours-by-status.
- **AI-ready** — bundles the published `rayfin` AI skill and Rayfin MCP server.

> **Basic example.** This template is intentionally small — one entity, one page, the four CRUD
> operations. Use it as the starting point for a SQL-backed app and add entities/pages from here.

## Getting started

> **Prerequisite — `@microsoft` npm scope.** Rayfin packages (including the
> `@microsoft/create-rayfin` initializer) live on the **public Microsoft package feed**, not GitHub
> Packages. If your machine has a user-level `.npmrc` that maps the `@microsoft` scope to
> `https://npm.pkg.github.com`, `npm create @microsoft/rayfin` fails with
> `401 Unauthorized ... @microsoft%2fcreate-rayfin`. Fix it one of these ways:
>
> **Per command (no global change):**
> ```powershell
> npm create @microsoft/rayfin --@microsoft:registry=https://packagefeedproxy.microsoft.io/npm/ -- --template https://github.com/memasanz/mm-rayfin-templates
> ```
> Run it **all on one line** — in PowerShell a trailing `\` is a literal character (not a line
> continuation), and gets passed to the scaffolder as the target directory, resolving to `C:\` and
> failing with `Failed to clear target directory 'C:\': EPERM`.
>
> **Permanently (recommended if you use Rayfin often):** point the scope at the Microsoft feed:
> ```bash
> npm config set @microsoft:registry https://packagefeedproxy.microsoft.io/npm/
> ```
> Verify with `npm config get @microsoft:registry`. The scaffolded project already includes an
> `.npmrc` with this pin, so `npm install` inside the project works regardless.

```bash
# Install dependencies (uses the pinned @microsoft feed in .npmrc)
npm install

# Deploy/attach a Rayfin backend and start the Vite dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and sign in. Against a **local** backend you are
signed in with a mock dev account and the app renders the in-memory sample requests immediately —
create/edit/delete all work, but changes are kept in memory for the session. Against a **Fabric**
backend, the sample requests are seeded into the SQL database on first load if it is empty, and every
change is persisted.

To build the static bundle Fabric hosts:

```bash
npm run build        # tsc -b && vite build  → dist/
npm run preview      # preview the built bundle
```

## Required files

Every file below is required for this template to build, run, and be picked up by the Rayfin gallery
CLI. This table doubles as a checklist if you fork the template.

| File | Why it's needed |
| --- | --- |
| `package.json` | Template metadata (the `template` object — `name`, `displayName`, `description`) that the gallery reads, plus dependencies and the `dev`/`build`/`build:fabric`/`lint`/`test` scripts. `template.name` **must** match the directory name. |
| `manifest.json` | Gallery manifest: `templateId` (must equal `template.name`), `icon`, the `services` capability booleans (auth/data/storage/staticHosting), `hasDabSchema`, and replacement `tokens`. |
| `rayfin-template.yml` | Leaf template manifest the CLI reads when scaffolding this single template. Contains `apiVersion: v1`, `metadata`, and an `entries` item with `path: .`. |
| `rayfin/rayfin.yml` | Rayfin **service configuration** — enables auth (Fabric + password), the data API (`mssql` dialect), and static hosting (build command + output folder). `id`/`name` must match the directory name. |
| `rayfin/data/schema.ts` | The Rayfin **data model**. Aggregates the decorator-based entity classes into the `schema` array and the `AppSchema` type the typed client is generic over. |
| `rayfin/data/Requests.ts` | The single entity definition (`@entity`, `@uuid`, `@text`, `@int`, `@date`). Uses Rayfin's default permissions (any authenticated caller has full CRUD). |
| `rayfin/tsconfig.json` | Isolated TypeScript config for the `rayfin/` project (Node module resolution, emit for DAB), kept separate from the app TS config and wired via a project reference. |
| `index.html` | Vite HTML entry document that loads `src/main.tsx`. |
| `src/main.tsx` | React entry point — bootstraps auth, wraps the app in `AuthProvider`, imports the global stylesheet. |
| `tsconfig.json` | Root app TypeScript config (ES2022, `react-jsx`, `@/*` path alias, TC39 decorators lib), referencing `./rayfin`. |
| `vite.config.ts` | Vite build config — React SWC plugin, Tailwind plugin, `@` alias, ES2022 target. |
| `vitest.config.ts` | Test runner config (jsdom environment, `@` alias). |
| `eslint.config.js` | ESLint 9 flat config with the TypeScript + React Hooks rule set. |
| `.gitignore` | Ignores build artifacts, dependencies, and Rayfin-generated files (`rayfin/.temp`, `.env`, lockfiles). |
| `.npmrc` | Pins the `@microsoft` scope to the public Microsoft package feed. Required because some machines map `@microsoft` to GitHub Packages (which 401s for Rayfin), and npm does not read the gallery-root `.npmrc`. |

### Bundled AI-agent files (recommended, not gallery-mandated)

| File | Why it's included |
| --- | --- |
| `.agents/skills/rayfin/SKILL.md` | The **published, version-locked `rayfin` skill** (`author: microsoft`, `rayfin-managed: true`). Gives AI coding agents authoritative Rayfin context — decorators, auth, deployment, CLI, and how to reach the version-locked docs. Shipped **verbatim**; do not edit or hand-author your own. |
| `.mcp.json` | Declares the `rayfin` MCP server for GitHub Copilot using its `servers` schema. |
| `.cursor/mcp.json` | Declares the same MCP server for Cursor using its `mcpServers` schema. |
| `AGENTS.md` | Tells agents to load the skill and MCP server before writing Rayfin code, and how to fall back to `rayfin docs ...`. |

## Project structure

```
services-crud-tracker/
├── .agents/skills/rayfin/SKILL.md   # published Rayfin AI skill (verbatim)
├── .cursor/mcp.json                 # Rayfin MCP server for Cursor
├── .mcp.json                        # Rayfin MCP server for GitHub Copilot
├── AGENTS.md                        # agent onboarding notes
├── manifest.json                    # gallery capabilities manifest
├── rayfin-template.yml              # leaf template manifest
├── rayfin/
│   ├── rayfin.yml                   # service config (auth + data + hosting)
│   ├── tsconfig.json                # isolated Rayfin TS config
│   └── data/
│       ├── Requests.ts              # the single service-request entity
│       └── schema.ts                # schema array + AppSchema type
├── src/
│   ├── main.tsx                     # bootstrap + AuthProvider
│   ├── App.tsx                      # routes + auth guard
│   ├── data/
│   │   └── sampleData.ts            # TEAMS/PRIORITIES/STATUSES + sample requests
│   ├── services/
│   │   ├── rayfinClient.ts          # typed RayfinClient init + isLocalBackend()
│   │   ├── bootstrap.ts             # env → client + auth-service wiring
│   │   ├── IAuthService.ts          # auth contract
│   │   ├── MockAuthService.ts       # local email/password auth
│   │   ├── RayfinAuthService.ts     # Fabric brokered auth
│   │   ├── requests.ts              # CRUD (create/read/update/delete) + local in-memory store
│   │   ├── stats.ts                 # pure KPI / group-count helpers
│   │   └── seed.ts                  # ensureSeeded() — seeds a fresh SQL database
│   ├── hooks/
│   │   └── AuthContext.tsx          # React auth context + useAuth()
│   ├── components/
│   │   ├── AuthPage.tsx             # sign-in screen
│   │   ├── ErrorBoundary.tsx        # top-level error boundary
│   │   ├── RequestFormModal.tsx     # create/edit request modal form
│   │   └── HorizontalBarChart.tsx   # D3 reusable horizontal bars
│   ├── pages/
│   │   └── RequestsPage.tsx         # header, hero, KPIs, charts, records table + CRUD actions
│   ├── styles/
│   │   └── main.css                 # Contoso design tokens + components
│   └── __tests__/
│       ├── analytics.test.ts        # sample-data + stats aggregation tests
│       └── metrics.test.ts          # createdOn date-normalization contract
└── (config: package.json, tsconfig.json, vite/vitest/eslint configs, index.html, .gitignore, .npmrc)
```

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Runs `rayfin up` (excluding static hosting), then starts the Vite dev server. |
| `npm run build` | Type-checks (`tsc -b`) and builds the production bundle to `dist/`. |
| `npm run build:fabric` | Same build, invoked by Rayfin static hosting during deploy. |
| `npm run preview` | Serves the built `dist/` bundle locally. |
| `npm run lint` | Runs ESLint over the project. |
| `npm run test` | Runs the Vitest suite once. |
| `npm run rayfin:up` | Deploys/attaches the Rayfin backend. |

## Data model & sample data

One entity models the domain. It uses Rayfin's **default permissions** — any authenticated caller
can read/write; tighten later with `@authenticated`/`@role` policies (add
`policy: (claims, item) => claims.sub.eq(item.owner_id)` for per-user row-level security):

- **`Requests`** — a single service request: `id`, `title`, `team`, `owner`, `priority`, `status`,
  `estimateHours`, `createdOn`. Every column maps to an editable field in the create/edit form.

`src/data/sampleData.ts` defines the allowed `TEAMS` / `PRIORITIES` / `STATUSES` and a handful of
seed requests. Seeding is handled by `ensureSeeded()`:

- **Local backend** — the `requests` service keeps an in-memory store seeded lazily from the sample
  list, so the first paint is never empty and CRUD works without a database.
- **Fabric backend** — if no requests exist, the full sample set is inserted so a fresh SQL database
  is never empty. Idempotent — after that, the app's create/edit/delete flows are the source of truth.

`stats.ts` holds the pure aggregation helpers (`computeKpis`, `countByTeam`, `estimateByStatus`) that
drive the KPI band and the two bar charts; they are unit-tested in `src/__tests__/`.

## Design system

All brand styling lives in `src/styles/main.css` as CSS custom properties and two component classes
(`contoso-hero`, `contoso-btn`). To reskin the app, change the `--color-brand-*` tokens and the
`--font-display` / `--radius-btn` values — every KPI, chart accent, hero, and button follows.

## Deploying to Fabric

`rayfin up` provisions the backend (auth + data + static hosting) into your Fabric workspace. The
publishable key and API URL are injected as the `__RAYFIN_PK__` / `__RAYFIN_API_URL__` tokens at
scaffold time and surfaced to the app via `VITE_RAYFIN_*` env vars (see `src/services/bootstrap.ts`).
Fabric SSO additionally requires `VITE_FABRIC_WORKSPACE_ID`, `VITE_FABRIC_ITEM_ID`, and
`VITE_FABRIC_PORTAL_URL`. See the bundled `rayfin` skill and `rayfin docs` for the full deployment
workflow.

Pushes to `main` run `.github/workflows/deploy.yml`, which uses GitHub OIDC to sign in as a service
principal and deploy non-interactively. Configure these GitHub repository Actions variables before
the first run:

| Type | Name | Value |
| --- | --- | --- |
| Variable | `AZURE_CLIENT_ID` | Service principal application (client) GUID |
| Variable | `AZURE_TENANT_ID` | Microsoft Entra tenant GUID |
| Variable | `RAYFIN_WORKSPACE_ID` | Target Fabric workspace GUID |

The service principal must have a GitHub federated credential scoped to this repository's `main`
branch, be allowed to use Fabric APIs, and have deployment access to the target workspace. No client
secret or Azure subscription role is required; the workflow intentionally uses tenant-only login.

## Build your data model from a spreadsheet

This template bundles a **`spreadsheet-to-datamodel`** skill
(`.agents/skills/spreadsheet-to-datamodel/`) that turns a user's `.csv` / `.xlsx` / `.xlsm`
into Rayfin entities in this template's shape. A Python profiler
(`scripts/profile_spreadsheet.py`) deterministically infers sheets, column types, keys, and
cross-sheet relationships; the AI agent then reviews that profile with you and authors
`rayfin/data/*.ts` + seed data. Macros are inspected, never executed. See the skill's `SKILL.md`
for the full workflow.

```bash
pip install -r .agents/skills/spreadsheet-to-datamodel/scripts/requirements.txt
python .agents/skills/spreadsheet-to-datamodel/scripts/profile_spreadsheet.py <your-file> --draft-entities
```

## Next steps

- **More entities** — add a second `@entity` class in `rayfin/data/`, register it in `schema.ts`,
  and add a matching service + page.
- **Validation & row-level security** — tighten the `Requests` entity with `@authenticated`/`@role`
  policies and an owner-based `policy` predicate.
- **Filtering & search** — add query params to `getRequests()` and filter controls to the table.
