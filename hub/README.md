# Central Hub

Central Hub is the provisioning and lifecycle control plane for short-lived citizen-development projects in the `citizen-dev-proserv` GitHub organization. It turns a GitHub issue into a ready-to-use repository with the template, cloud identity, deployment settings, and access controls required by the selected project type.

## What it provides

- **Template-based repositories** created from an approved catalog with private or internal visibility.
- **Rayfin apps** configured for deployment to a shared Microsoft Fabric development workspace.
- **Passwordless Azure access** through a dedicated managed identity federated to each repository's `main` branch.
- **Scoped container access** for standard repositories, limited to their own path in the shared Azure Container Registry.
- **Automatic configuration** of the GitHub Actions variables and protected paths owned by the provisioning system.
- **Managed cleanup** of the repository and its dedicated cloud resources when the project expires or is no longer needed.

Central Hub is not an application runtime. It coordinates GitHub, Azure, and Microsoft Fabric so generated repositories can own their application code and deployment workflows.

## Provisioning flow

1. A user opens either a **Create a repository** or **Provision a Rayfin app** issue and selects an approved template.
2. GitHub Actions validates the request and creates the repository from that template.
3. Central Hub creates the project's Azure resource group and dedicated deployment identity, then configures repository-specific access and Actions settings.
4. For a standard repository, access to the shared container registry is restricted to that project's image path. For a Rayfin app, the deployment identity receives access to the development Fabric workspace.
5. Central Hub pushes the initial configuration to `main`, which starts the deployment workflow supplied by the template.
6. The original issue remains open as the project's lifecycle and audit record.

## Managed lifecycle

Provisioned repositories are temporary by design:

- Closing the provisioning issue requests immediate deletion.
- A warning is added after six days.
- The repository is automatically deleted after seven days.
- Cleanup removes the associated resource group, identities, role assignments, and other managed resources.
- The closed issue is retained as the lifecycle record.

## Project structure

| Path | Purpose |
| --- | --- |
| `.github/ISSUE_TEMPLATE/` | User-facing forms for repository and Rayfin requests. |
| `.github/workflows/provision-*.yml` | Request validation, repository creation, identity setup, and initial deployment. |
| `.github/workflows/delete-*.yml` | Safe removal of managed repositories and their cloud resources. |
| `.github/workflows/expire-*.yml` | Daily warning and expiration processing. |
| `infra/` | Bicep definitions for the shared Azure resource group and container registry. |

## Operating model

The hub relies on centrally managed GitHub credentials, Azure workload identity federation, approved template repositories, and preconfigured organization-level cloud access. Rayfin provisioning additionally requires administrator access to the target Fabric workspace. Application teams do not receive shared client secrets; each generated repository uses its own federated identity.

Changes to templates, issue forms, workflows, or shared infrastructure should be made here so provisioning behavior remains consistent across all generated projects.