# 8. Security and trust boundaries

The primary security pattern is central bootstrap authority followed by per-project, secretless workload identities with narrower scopes.

```mermaid
flowchart TB
    subgraph Human["Human and agent boundary"]
        User["Citizen developer"]
        Agent["Coding agent"]
        Admin["Platform administrator"]
    end

    subgraph Control["Privileged control plane"]
        Hub["Central-hub workflows"]
        Token["ORG_PROVISIONING_TOKEN<br/>organization GitHub administration"]
        HubIdentity["Central Azure identity<br/>subscription roles + Fabric Admin"]
        Forms["Allow-listed issue forms<br/>templates + visibility"]
    end

    subgraph GitHub["Generated repository boundary"]
        AppCode["Application-owned source"]
        Protected["Protected paths<br/>workflows + infra or Rayfin config"]
        Variables["Non-secret deployment coordinates"]
        ProjectOIDC["GitHub OIDC subject<br/>repository ID + main branch"]
    end

    subgraph Project["Per-project cloud boundary"]
        DeployID["Dedicated deployment identity"]
        RG["Dedicated resource group"]
        RuntimeID["Dedicated runtime pull identity"]
    end

    subgraph Shared["Shared-service boundary"]
        ACR["Shared ACR<br/>conditional per-path roles"]
        Fabric["Shared Fabric workspace<br/>Contributor per project"]
    end

    User --> Agent
    Agent --> AppCode
    Agent -. "must not change" .-> Protected
    Admin --> Forms
    Admin --> Hub
    Token --> Hub
    HubIdentity --> Hub
    Forms --> Hub
    Hub --> Protected
    Hub --> Variables
    Hub --> ProjectOIDC
    ProjectOIDC --> DeployID
    DeployID --> RG
    DeployID -->|"Azure project: conditional Writer"| ACR
    RuntimeID -->|"Azure project: conditional Reader"| ACR
    DeployID -->|"Rayfin project: Contributor"| Fabric

    classDef human fill:#fff4cc,stroke:#8a6d00,color:#111;
    classDef control fill:#fee2e2,stroke:#dc2626,color:#111;
    classDef github fill:#dbeafe,stroke:#2563eb,color:#111;
    classDef project fill:#dcfce7,stroke:#16803a,color:#111;
    classDef shared fill:#ede9fe,stroke:#7c3aed,color:#111;
    class User,Agent,Admin human;
    class Hub,Token,HubIdentity,Forms control;
    class AppCode,Protected,Variables,ProjectOIDC github;
    class DeployID,RG,RuntimeID project;
    class ACR,Fabric shared;
```

## Security controls by stage

| Stage | Control |
| --- | --- |
| Request | Exact field parsing, repository-name regex, allow-listed visibility, and allow-listed templates. |
| Repository creation | Repositories are initially private; only explicit `internal` requests are widened. Public is not accepted. |
| Authentication | GitHub Actions uses OIDC federation rather than stored Azure client secrets. |
| Identity binding | Federated subject includes organization ID, repository ID, repository name, and `refs/heads/main`. |
| Azure authorization | Deployment identity is Contributor only on its resource group. |
| Shared registry | ABAC conditions restrict Writer and Reader roles to one image repository path. |
| Fabric authorization | Generated Rayfin identity is Contributor, while central provisioning retains Admin. |
| Source protection | Active rulesets restrict centrally managed workflows and infrastructure/configuration paths. |
| Retirement | Lifecycle marker, organization checks, repository-ID lookup, and separate type-specific cleanup. |

## Privileged configuration

The central hub depends on:

- `ORG_PROVISIONING_TOKEN` for organization-level GitHub operations;
- `TEMPLATE_RAYFIN_WORKSPACE_ID` for the target Fabric workspace;
- Azure tenant, subscription, location, client ID, and shared-resource-group variables; and
- a central managed identity with sufficient Azure and Fabric authority.

These controls make central-hub administration the highest-trust boundary. Template and workflow changes therefore require platform-administrator review.

## Evidence

- [Setup guide](../docs/setup.md)
- [Azure provisioning workflow](../hub/.github/workflows/provision-repository.yml)
- [Rayfin provisioning workflow](../hub/.github/workflows/provision-rayfin.yml)
- [Update operating procedure](../skills/update-project/SKILL.md)
