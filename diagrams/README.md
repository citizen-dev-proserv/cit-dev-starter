# Architecture diagrams

This folder documents the implemented architecture of `cit-dev-starter`, from the repository's source layout through provisioning, deployment, operation, and retirement.

## Diagram index

| # | Diagram | What it explains |
| --- | --- | --- |
| 1 | [System context](01-system-context.md) | People, the central control plane, generated projects, GitHub, Azure, Fabric, and the coding agent. |
| 2 | [Repository blueprint](02-repository-blueprint.md) | How this source repository is organized and how its parts become separately hosted GitHub repositories. |
| 3 | [Azure project provisioning](03-azure-project-provisioning.md) | The complete issue-to-running-app sequence for the standard Azure template. |
| 4 | [Rayfin project provisioning](04-rayfin-project-provisioning.md) | The complete issue-to-Fabric-app sequence for Rayfin templates. |
| 5 | [Azure spoke runtime](05-azure-spoke-runtime.md) | Container build, image storage, workload identities, and Azure Container Apps runtime traffic. |
| 6 | [Rayfin CRUD template](06-rayfin-crud-template.md) | React, authentication, data access, analytics, Rayfin services, and local-development substitutions. |
| 7 | [Lifecycle and cleanup](07-lifecycle-and-cleanup.md) | Lifecycle issue states, six-day warning, seven-day expiry, and type-specific teardown. |
| 8 | [Security and trust boundaries](08-security-and-trust-boundaries.md) | Identity federation, least-privilege scopes, protected paths, credentials, and administrator boundaries. |
| 9 | [Responsibilities and change flow](09-responsibilities-and-change-flow.md) | What platform administrators, citizen developers, agents, templates, and automation own. |
| 10 | [Associated resources and dependencies](10-associated-resources.md) | External repositories, actions, package feeds, APIs, cloud prerequisites, and what could be publicly verified. |

For presentation use, see the [slide-ready flow diagrams](slide-ready/README.md). These are intentionally simplified and include exported SVG files sized for widescreen slides.

## How to read the set

- Solid arrows are implemented control or data flows.
- Dashed arrows are human interaction, policy, or configuration relationships.
- Red nodes identify privileged control-plane components or destructive operations.
- Blue nodes identify GitHub resources.
- Purple nodes identify Microsoft Fabric and Rayfin resources.
- Green nodes identify Azure application resources.
- Gray nodes identify local development or source-only artifacts.

The diagrams describe the checked-in implementation, not a generic target architecture. Where prose documentation and workflow behavior differ, the notes call out the implemented workflow behavior.

## Scope and important distinctions

1. This repository is the **source bundle**. During setup, `hub/` becomes the separately hosted `central-hub` repository, and each directory under `templates/` becomes an approved GitHub template repository.
2. The central hub is a **control plane**, not an application runtime.
3. Every generated project is a temporary **spoke** with a dedicated repository, Azure resource group, and deployment identity.
4. Azure and Rayfin spokes share lifecycle mechanics but have different deployment and deletion paths.
5. The lifecycle marker in the provisioning issue is the authoritative link between a request and its managed repository.

## Primary evidence

- [Platform overview](../docs/overview.md)
- [Setup guide](../docs/setup.md)
- [Template guidance](../docs/templates.md)
- [Central Hub README](../hub/README.md)
- [Azure provisioning workflow](../hub/.github/workflows/provision-repository.yml)
- [Rayfin provisioning workflow](../hub/.github/workflows/provision-rayfin.yml)
- [Azure deletion workflow](../hub/.github/workflows/delete-repository.yml)
- [Rayfin deletion workflow](../hub/.github/workflows/delete-rayfin.yml)
- [Azure expiry workflow](../hub/.github/workflows/expire-repositories.yml)
- [Rayfin expiry workflow](../hub/.github/workflows/expire-rayfin.yml)
- [Azure test template](../templates/test-template/README.md)
- [Rayfin CRUD tracker template](../templates/services-crud-tracker-template/README.md)
- [Project creation skill](../skills/create-project/SKILL.md)
- [Project update skill](../skills/update-project/SKILL.md)
- [Project deletion skill](../skills/delete-project/SKILL.md)

## Known implementation notes

- The setup guide describes this as a proof of concept and recommends stronger production practices such as GitHub Environments.
- The template guide discusses required `provision.yml` and `destroy.yml` workflows conceptually. The checked-in Azure test template instead combines infrastructure creation and application deployment in `deploy.yml`; the Rayfin template uses `deploy.yml` and `destroy.yml`.
- The approved Rayfin issue form includes an analytics-dashboard template that is referenced as an external template repository but is not included in this source tree.
- The referenced operational repositories (`central-hub` and the three template repositories) were not publicly resolvable during review. They may be private, internal, not yet published, or retired; the public API cannot distinguish those cases.
- The setup guide documents `TEMPLATE_ACR_NAME`, while the checked-in Azure provisioning workflow discovers the single registry in `AZURE_SHARED_RESOURCE_GROUP`.
- The workflow files under `hub/` and `templates/` are distribution assets and are not active as repository-root workflows in `cit-dev-starter`.
- Generated repositories expire after seven days; these are development environments, not production systems.
