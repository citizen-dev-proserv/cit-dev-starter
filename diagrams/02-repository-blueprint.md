# 2. Repository blueprint

The checked-in repository packages the documentation, control plane, project templates, and agent-facing operating procedures needed to establish the platform.

```mermaid
flowchart TB
    Root["cit-dev-starter source repository"]

    Root --> Docs["docs/<br/>platform narrative, setup, template guidance"]
    Root --> Skills["skills/<br/>create, update, delete operating procedures"]
    Root --> HubSource["hub/<br/>control-plane source"]
    Root --> Templates["templates/<br/>approved project starters"]

    HubSource --> IssueForms["Issue forms<br/>Azure request + Rayfin request"]
    HubSource --> Workflows["GitHub Actions<br/>provision + expire + delete"]
    HubSource --> SharedIaC["Bicep<br/>shared resource group + ACR"]

    Templates --> AzureTemplate["test-template/<br/>Python + Docker + Bicep + deploy workflow"]
    Templates --> CrudTemplate["services-crud-tracker-template/<br/>React + Rayfin + deploy/destroy workflows"]
    Templates -. "approved but not included here" .-> AnalyticsTemplate["services-analytics-dashboard-template"]

    HubSource == "published during setup" ==> HubRepo["central-hub repository"]
    AzureTemplate == "published as template repo" ==> AzureTemplateRepo["test-template repository"]
    CrudTemplate == "published as template repo" ==> CrudTemplateRepo["services-crud-tracker-template repository"]

    HubRepo --> GeneratedAzure["Generated Azure spoke repositories"]
    HubRepo --> GeneratedRayfin["Generated Rayfin spoke repositories"]
    AzureTemplateRepo --> GeneratedAzure
    CrudTemplateRepo --> GeneratedRayfin
    AnalyticsTemplate --> GeneratedRayfin

    classDef source fill:#f3f4f6,stroke:#64748b,color:#111;
    classDef github fill:#dbeafe,stroke:#2563eb,color:#111;
    classDef external fill:#fff7ed,stroke:#ea580c,color:#111,stroke-dasharray:5 5;
    class Root,Docs,Skills,HubSource,Templates,IssueForms,Workflows,SharedIaC,AzureTemplate,CrudTemplate source;
    class HubRepo,AzureTemplateRepo,CrudTemplateRepo,GeneratedAzure,GeneratedRayfin github;
    class AnalyticsTemplate external;
```

## What each area owns

| Area | Responsibility |
| --- | --- |
| `docs/` | Platform rationale, administrator setup, and template conventions. |
| `skills/` | Safe agent procedures for project creation, bounded updates, and destructive retirement. |
| `hub/` | GitHub issue intake, validation, repository creation, cloud identity provisioning, expiry, and deletion. |
| `templates/test-template/` | Minimal Azure-hosted Python service and its container/infrastructure deployment path. |
| `templates/services-crud-tracker-template/` | Fabric-hosted React CRUD application, Rayfin schema, auth, deployment, and destruction. |

## Evidence

- [Setup guide](../docs/setup.md)
- [Template guidance](../docs/templates.md)
- [Central Hub structure](../hub/README.md)
