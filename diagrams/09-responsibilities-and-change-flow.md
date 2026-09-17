# 9. Responsibilities and change flow

Governance works by splitting platform-owned controls from application-owned behavior.

```mermaid
flowchart LR
    subgraph PlatformTeam["Platform administrator responsibility"]
        Catalog["Approve and version templates"]
        HubLogic["Maintain issue forms and lifecycle workflows"]
        SharedInfra["Operate shared Azure and Fabric resources"]
        Policy["Protect workflows, infrastructure, and config"]
        Exceptions["Handle failures, exceptions, and production handoff"]
    end

    subgraph Automation["Central automation responsibility"]
        Validate["Validate request"]
        Bootstrap["Create repo, identities, roles, variables"]
        Audit["Write lifecycle metadata"]
        Expire["Warn, expire, and delete"]
    end

    subgraph Builder["Citizen developer and coding agent responsibility"]
        Outcome["Define business outcome"]
        AppChange["Change application source and data model"]
        LocalCheck["Build, test, and review locally"]
        Approval["Approve push to main"]
    end

    subgraph Spoke["Generated project"]
        Editable["Editable<br/>application code, UI, business logic"]
        Conditional["Conditionally editable<br/>Rayfin data model"]
        Locked["Platform managed<br/>workflows, Azure infra, Rayfin config"]
        Pipeline["main branch deployment"]
    end

    Catalog --> Validate
    HubLogic --> Validate
    SharedInfra --> Bootstrap
    Policy --> Locked
    Validate --> Bootstrap
    Bootstrap --> Audit
    Audit --> Expire

    Outcome --> AppChange
    AppChange --> Editable
    AppChange --> Conditional
    AppChange -. "blocked by policy" .-> Locked
    Editable --> LocalCheck
    Conditional --> LocalCheck
    LocalCheck --> Approval
    Approval --> Pipeline

    Pipeline --> Exceptions
    Expire --> Exceptions

    classDef admin fill:#fee2e2,stroke:#dc2626,color:#111;
    classDef automation fill:#dbeafe,stroke:#2563eb,color:#111;
    classDef builder fill:#fff4cc,stroke:#8a6d00,color:#111;
    classDef spoke fill:#dcfce7,stroke:#16803a,color:#111;
    class Catalog,HubLogic,SharedInfra,Policy,Exceptions admin;
    class Validate,Bootstrap,Audit,Expire automation;
    class Outcome,AppChange,LocalCheck,Approval builder;
    class Editable,Conditional,Locked,Pipeline spoke;
```

## Change rules

- Citizen developers own application behavior inside a generated spoke.
- Azure `infra/**` and all `.github/workflows/**` are centrally managed and must not be modified in a generated project.
- Rayfin `rayfin/rayfin.yml` is centrally managed; `rayfin/data/**` may change when the application needs a schema change.
- Local edits and validation are reversible. Pushing to `main` can deploy immediately and requires explicit user approval under the update procedure.
- Central Hub owns provisioning, expiry, and deletion. It has no application-update workflow.
- Production-like use, long-term ownership, and exceptions require explicit platform-administrator handoff rather than bypassing controls.

## Agent-facing lifecycle

```mermaid
flowchart LR
    CreateSkill["create-project skill"] -->|"open verified hub issue"| ManagedRepo["Managed spoke repository"]
    ManagedRepo --> UpdateSkill["update-project skill"]
    UpdateSkill -->|"safe application changes"| ManagedRepo
    ManagedRepo --> DeleteSkill["delete-project skill"]
    DeleteSkill -->|"exact-name confirmation then close issue"| Cleanup["Central managed cleanup"]
```

## Evidence

- [Create project procedure](../skills/create-project/SKILL.md)
- [Update project procedure](../skills/update-project/SKILL.md)
- [Delete project procedure](../skills/delete-project/SKILL.md)
- [Template guidance](../docs/templates.md)
