# 1. System context

This is the highest-level view of the governed citizen-development platform.

```mermaid
flowchart LR
    Developer["Citizen developer"]
    Admin["Platform administrator"]
    Agent["Coding agent"]

    subgraph GitHub["GitHub organization"]
        Hub["Central Hub<br/>issues + workflows"]
        Catalog["Approved template repositories"]
        Spoke["Generated spoke repository<br/>application code + deployment workflow"]
        Audit["Lifecycle issue<br/>owner + creation time + repository ID"]
    end

    subgraph Azure["Azure subscription"]
        Shared["Shared resource group<br/>ACR"]
        ProjectRG["Per-project resource group<br/>managed identities + app resources"]
        OIDC["Microsoft Entra workload identity<br/>OIDC federation"]
    end

    subgraph Fabric["Microsoft Fabric"]
        Workspace["Shared development workspace"]
        RayfinApp["Rayfin AppBackend<br/>auth + data + static hosting"]
    end

    Developer -. "opens request" .-> Hub
    Developer -. "describes and changes app" .-> Agent
    Agent --> Spoke
    Admin -. "curates templates and controls" .-> Hub
    Admin -. "approves platform resources" .-> Azure
    Admin -. "grants hub Admin role" .-> Workspace

    Hub --> Catalog
    Hub --> Spoke
    Hub --> Audit
    Audit -. "remains open while project exists" .-> Spoke

    Spoke --> OIDC
    OIDC --> ProjectRG
    ProjectRG --> Shared
    Spoke --> RayfinApp
    RayfinApp --> Workspace

    classDef person fill:#fff4cc,stroke:#8a6d00,color:#222;
    classDef github fill:#dbeafe,stroke:#2563eb,color:#111;
    classDef azure fill:#dcfce7,stroke:#16803a,color:#111;
    classDef fabric fill:#ede9fe,stroke:#7c3aed,color:#111;
    classDef control fill:#fee2e2,stroke:#dc2626,color:#111;
    class Developer,Admin,Agent person;
    class Catalog,Spoke,Audit github;
    class Hub control;
    class Shared,ProjectRG,OIDC azure;
    class Workspace,RayfinApp fabric;
```

## Key points

1. Users request projects through central-hub issue forms; they do not create governed repositories or cloud resources directly.
2. The hub creates a repository from an approved template and configures its identity, variables, restrictions, and initial deployment.
3. Azure projects run in Azure Container Apps and use a shared Azure Container Registry with repository-scoped permissions.
4. Rayfin projects deploy into a shared Fabric development workspace using a dedicated per-repository identity.
5. The open provisioning issue is both the audit record and lifecycle switch. Closing it requests deletion.

## Evidence

- [Platform overview](../docs/overview.md)
- [Central Hub README](../hub/README.md)
- [Setup guide](../docs/setup.md)
