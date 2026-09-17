# 3. Azure project provisioning

This sequence follows the implemented `[Create repository]` workflow from request to initial deployment.

```mermaid
sequenceDiagram
    autonumber
    actor User as Citizen developer
    participant Issue as Central-hub issue
    participant Hub as provision-repository workflow
    participant GH as GitHub API
    participant Azure as Azure Resource Manager
    participant Entra as Microsoft Entra ID
    participant ACR as Shared ACR
    participant Repo as Generated repository
    participant Deploy as deploy workflow
    participant ACA as Azure Container Apps

    User->>Issue: Submit name, description, template, visibility
    Issue->>Hub: issues.opened event
    Hub->>Hub: Parse and validate exact issue fields
    Hub->>GH: Generate repository from approved test-template
    Hub->>Azure: Create rg-cd-repositoryId
    Hub->>Azure: Create GitHub deployment identity
    Hub->>Azure: Create Container App pull identity
    Hub->>Entra: Federate GitHub main branch to deployment identity
    Hub->>Azure: Grant Contributor on project resource group
    Hub->>ACR: Grant conditional Writer to project image path
    Hub->>ACR: Grant conditional Reader to runtime identity
    Hub->>GH: Set lifecycle, Azure, and ACR repository variables
    Hub->>GH: Set generated TEST_SECRET
    Hub->>Repo: Push empty commit to main
    Hub->>GH: Protect infra and workflow paths
    Repo->>Deploy: main push starts deployment
    Deploy->>Entra: Exchange GitHub OIDC token
    Deploy->>Deploy: Build container image
    Deploy->>ACR: Push immutable SHA tag and latest tag
    Deploy->>Azure: Deploy Bicep to project resource group
    Azure->>ACA: Create environment and external container app
    ACA->>ACR: Pull image with runtime identity
    Hub->>Issue: Add lifecycle marker and seven-day policy
```

## Provisioned Azure resources and controls

- Resource group: `rg-cd-<repository-id>`.
- Deployment identity: `id-gh-<repository-id>`, federated only to the generated repository's `main` branch.
- Runtime image-pull identity: `id-aca-<repository-id>`.
- ACR image path: `citizen-dev/<lowercase-repository-name>`.
- Repository ruleset: prevents changes to `infra/**/*` and `.github/workflows/**/*`.
- Container App: external ingress on port `8000`, single active revision, `0-3` replicas.

## Failure behavior

Validation or provisioning failures produce an issue comment linking to the failed workflow. The workflow does not report a success-shaped fallback.

## Evidence

- [Azure issue form](../hub/.github/ISSUE_TEMPLATE/create-repository.yml)
- [Azure provisioning workflow](../hub/.github/workflows/provision-repository.yml)
- [Azure deployment workflow](../templates/test-template/.github/workflows/deploy.yml)
- [Container App Bicep](../templates/test-template/infra/resources.bicep)
