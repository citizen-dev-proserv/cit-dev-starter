# 6. Rayfin CRUD tracker template

The CRUD tracker is a React/Vite frontend backed by Rayfin authentication, SQL data services, and static hosting in Microsoft Fabric. Local development substitutes mock authentication and in-memory data.

```mermaid
flowchart TB
    subgraph Browser["Browser application"]
        Main["main.tsx<br/>bootstrap + providers"]
        Router["App.tsx<br/>routing + AuthGuard"]
        AuthPage["AuthPage"]
        RequestsPage["RequestsPage<br/>table, form, KPIs, charts"]
        AuthContext["AuthContext<br/>session + sign in/out"]
        RequestService["requests service<br/>CRUD abstraction"]
        Stats["stats service<br/>KPIs + grouped metrics"]
        Client["RayfinClient singleton"]
    end

    subgraph Production["Fabric-hosted mode"]
        FabricAuth["Fabric auth provider"]
        Rayfin["Rayfin AppBackend"]
        Data["MSSQL Requests entity"]
        Static["Rayfin static hosting<br/>dist"]
    end

    subgraph Local["Local development mode"]
        MockAuth["MockAuthService<br/>development credentials"]
        Memory["In-memory request store<br/>sample data"]
        Vite["Vite development server"]
    end

    Main --> Router
    Main --> AuthContext
    Router --> AuthPage
    Router --> RequestsPage
    AuthPage --> AuthContext
    RequestsPage --> AuthContext
    RequestsPage --> RequestService
    RequestsPage --> Stats
    RequestService --> Client

    AuthContext -->|"non-local API"| FabricAuth
    FabricAuth --> Rayfin
    Client -->|"typed CRUD"| Rayfin
    Rayfin --> Data
    Static --> Browser

    AuthContext -. "localhost API" .-> MockAuth
    RequestService -. "local backend" .-> Memory
    Vite -. "serves UI" .-> Browser

    classDef app fill:#dbeafe,stroke:#2563eb,color:#111;
    classDef fabric fill:#ede9fe,stroke:#7c3aed,color:#111;
    classDef local fill:#f3f4f6,stroke:#64748b,color:#111;
    class Main,Router,AuthPage,RequestsPage,AuthContext,RequestService,Stats,Client app;
    class FabricAuth,Rayfin,Data,Static fabric;
    class MockAuth,Memory,Vite local;
```

## Application flow

1. `main.tsx` bootstraps authentication, then mounts the auth provider and error boundary.
2. `AuthGuard` holds protected routes until session resolution finishes.
3. `RequestsPage` loads data, seeds sample rows when the real backend is empty, and drives create/read/update/delete operations.
4. The statistics service computes KPIs, counts by team, and estimated hours by status for the dashboard.
5. The Rayfin schema defines one `Requests` entity with UUID, text, integer, and date fields.

## Production versus local development

| Concern | Production/Fabric | Local development |
| --- | --- | --- |
| Authentication | Fabric auth provider, embedded or interactive sign-in | Mock auth service |
| Data | Typed Rayfin client to MSSQL-backed entity | In-memory store |
| Hosting | Rayfin static hosting from built `dist` | Vite development server |
| Seeding | Insert samples once when the backend is empty | Start from bundled sample data |

## Deployment services

The Rayfin configuration enables authentication, data with the `mssql` dialect, and static hosting. Storage and functions are disabled. The GitHub deployment workflow runs `rayfin up` and then verifies status.

## Evidence

- [Template README](../templates/services-crud-tracker-template/README.md)
- [Application entry point](../templates/services-crud-tracker-template/src/main.tsx)
- [Router](../templates/services-crud-tracker-template/src/App.tsx)
- [Authentication context](../templates/services-crud-tracker-template/src/hooks/AuthContext.tsx)
- [CRUD service](../templates/services-crud-tracker-template/src/services/requests.ts)
- [Statistics service](../templates/services-crud-tracker-template/src/services/stats.ts)
- [Rayfin entity](../templates/services-crud-tracker-template/rayfin/data/Requests.ts)
- [Rayfin service configuration](../templates/services-crud-tracker-template/rayfin/rayfin.yml)
