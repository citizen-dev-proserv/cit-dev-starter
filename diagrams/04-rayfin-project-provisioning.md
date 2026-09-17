# 4. Rayfin project provisioning

This sequence follows the implemented `[Provision Rayfin]` workflow into the shared Fabric development workspace.

For presentation use, see the [simplified SVG](04-rayfin-project-provisioning-simple.svg) and its [Mermaid source](04-rayfin-project-provisioning-simple.mmd).

```mermaid
sequenceDiagram
    autonumber
    actor User as Citizen developer
    participant Issue as Central-hub issue
    participant Hub as provision-rayfin workflow
    participant GH as GitHub API
    participant Azure as Azure Resource Manager
    participant Entra as Microsoft Entra ID
    participant Fabric as Fabric API and workspace
    participant Repo as Generated repository
    participant Deploy as Rayfin deploy workflow
    participant App as Fabric AppBackend

    User->>Issue: Submit name, description, Rayfin template, visibility
    Issue->>Hub: issues.opened event
    Hub->>Hub: Validate fields and derive rayfin item ID
    Hub->>Entra: Sign in with central provisioning identity
    Hub->>Fabric: Verify central identity is workspace Admin
    Hub->>GH: Generate repository from approved Rayfin template
    Hub->>Azure: Create rg-cd-repositoryId
    Hub->>Azure: Create id-gh-repositoryId
    Hub->>Entra: Federate generated repo main branch
    Hub->>Fabric: Grant generated identity Contributor
    Hub->>GH: Set Azure, Fabric, and lifecycle variables
    Hub->>Repo: Replace Rayfin config id and name
    Hub->>Repo: Commit and push configuration to main
    Hub->>GH: Protect rayfin config and workflow paths
    Repo->>Deploy: main push starts deployment
    Deploy->>Entra: Exchange GitHub OIDC token
    Deploy->>Fabric: Obtain Fabric access token
    Deploy->>App: Run rayfin up
    Deploy->>App: Verify with rayfin up status
    Hub->>Issue: Add lifecycle and Fabric metadata markers
```

## Provisioned resources and controls

- Resource group: `rg-cd-<repository-id>`.
- Deployment identity: `id-gh-<repository-id>`.
- Fabric role: `Contributor` in the configured shared development workspace.
- Rayfin item ID: normalized `rayfin-<repository-name>-<issue-number>`, capped at 63 characters.
- Repository ruleset: prevents changes to `rayfin/rayfin.yml` and `.github/workflows/**/*`.
- Supported templates: analytics dashboard and CRUD tracker.

## Separation of authority

The central provisioning identity must be a Fabric workspace `Admin` so it can grant access. The generated repository identity receives only `Contributor`, which is used by the template's deployment workflow.

## Evidence

- [Rayfin issue form](../hub/.github/ISSUE_TEMPLATE/provision-rayfin.yml)
- [Rayfin provisioning workflow](../hub/.github/workflows/provision-rayfin.yml)
- [CRUD template deployment workflow](../templates/services-crud-tracker-template/.github/workflows/deploy.yml)
