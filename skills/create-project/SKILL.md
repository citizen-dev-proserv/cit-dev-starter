---
name: create-project
description: "Create and provision a governed citizen-development project from an approved Azure or Rayfin template. Use when a user asks to create, start, scaffold, or provision a new project or app."
---

# Create a Project

Create projects through a provisioning issue in `citizen-dev-proserv/central-hub`. The issue is the project's lifecycle record and must remain open while the project is needed. Citizen developers should not need to understand the underlying GitHub, Azure, or Fabric provisioning.

## Non-negotiable safeguards

- Use only the approved project types, templates, and visibility values below.
- Default to `private`. Use `internal` only when the user says everyone in the organization needs repository access. Never create a public repository.
- Never create the repository directly or provision Azure/Fabric resources manually. Create the central-hub issue and let its workflow perform provisioning.
- Before creating the issue, show the user the final project name, description, project type, template, visibility, seven-day expiry, and deletion behavior. Obtain explicit confirmation because opening the issue starts provisioning immediately.
- Never close the provisioning issue after successful creation. Closing it permanently deletes the managed repository and resources.
- Do not place credentials, customer data, personal data, or other secrets in the issue, repository name, or description.

## Approved choices

Choose the smallest suitable template from the user's business outcome:

| Need | Project type | Template | Issue title prefix |
| --- | --- | --- | --- |
| General Azure-hosted application or test service | Azure | `citizen-dev-proserv/test-template` | `[Create repository]` |
| Read-only metrics, reporting, or dashboard experience in Fabric | Rayfin | `citizen-dev-proserv/services-analytics-dashboard-template` | `[Provision Rayfin]` |
| Forms, tracking, or create/read/update/delete workflows in Fabric | Rayfin | `citizen-dev-proserv/services-crud-tracker-template` | `[Provision Rayfin]` |

If the request does not clearly fit one row, ask one plain-language question about whether users only view information or also add and change records. Do not guess between Rayfin templates. Explain that these are temporary development projects, not production systems.

## Gather and validate

Ask only for missing information:

1. What business problem should the project solve?
2. What short repository name should identify it?
3. Who needs repository access: only invited collaborators (`private`) or the organization (`internal`)?

Turn the business problem into a concise, non-sensitive description. Validate the repository name before any mutation:

- It must be 1-100 characters and contain only letters, numbers, periods, underscores, and hyphens.
- Prefer lowercase kebab-case. If normalization changes the user's name, show the result and ask them to accept it.
- Reject `central-hub`, template repository names, `.` and `..`, names ending in `.git`, and names that could be mistaken for platform infrastructure.
- Verify that `citizen-dev-proserv/<name>` does not already exist.
- Search open and recently closed central-hub issues for the same repository name. If an active request exists, use that request instead of creating a duplicate. If a previous project was deleted, explain that history before reusing the name.

## Create the request

Create exactly one issue in `citizen-dev-proserv/central-hub`. Use the issue form matching the selected project type. Preserve its title prefix, field labels, and allowed values exactly because the provisioning workflows parse them.

### Azure project issue template

Use this form for `citizen-dev-proserv/test-template`:

```yaml
name: Create a repository
description: Create a repository in citizen-dev-proserv from the approved template
title: "[Create repository] "
body:
  - type: markdown
    attributes:
      value: Provide the settings for the new repository.
  - type: input
    id: repository-name
    attributes:
      label: Repository name
      description: Use letters, numbers, periods, underscores, and hyphens only.
      placeholder: my-new-repository
    validations:
      required: true
  - type: input
    id: description
    attributes:
      label: Description
      placeholder: A short description of the repository
  - type: dropdown
    id: template-repository
    attributes:
      label: Template repository
      options:
        - citizen-dev-proserv/test-template
      default: 0
    validations:
      required: true
  - type: dropdown
    id: visibility
    attributes:
      label: Visibility
      options:
        - private
        - internal
      default: 0
    validations:
      required: true
```

### Rayfin project issue template

Use this form for a Fabric-hosted Rayfin application:

```yaml
name: Provision a Rayfin app
description: Create a Rayfin app repository with a development deployment workflow
title: "[Provision Rayfin] "
body:
  - type: markdown
    attributes:
      value: Create a Rayfin app from the standard template. Authentication and development deployment settings are configured automatically.
  - type: input
    id: repository-name
    attributes:
      label: Repository name
      description: Use letters, numbers, periods, underscores, and hyphens only.
      placeholder: my-rayfin-app
    validations:
      required: true
  - type: input
    id: description
    attributes:
      label: Description
      placeholder: A short description of the app
  - type: dropdown
    id: template-repository
    attributes:
      label: Template repository
      options:
        - citizen-dev-proserv/services-analytics-dashboard-template
        - citizen-dev-proserv/services-crud-tracker-template
      default: 0
    validations:
      required: true
  - type: dropdown
    id: visibility
    attributes:
      label: Visibility
      options:
        - private
        - internal
      default: 0
    validations:
      required: true
```

GitHub renders either form into an issue body with these headings. Verify the rendered body before submission:

```markdown
### Repository name
<validated-name>

### Description
<concise non-sensitive business purpose>

### Template repository
<approved-template>

### Visibility
<private-or-internal>
```

Use the corresponding title prefix followed by the repository name. Do not manually add labels, alter the prefix, or substitute an unapproved template.

## Wait for completion

After opening the issue:

1. Monitor its comments and the provisioning workflow until it reports success or failure. Do not infer success merely because a repository appears.
2. Success must include the bot's `citizen-dev-lifecycle` marker and a link to the exact repository.
3. On failure, give the user the workflow link and a plain-language summary. Do not create a second issue unless the first request cannot be retried and the user approves.
4. Before cloning, ensure the target folder does not exist or is empty. Never overwrite a local project.
5. Clone the exact repository from the lifecycle comment, open it as the working project, and read its `README.md`, `AGENTS.md`, and bundled skills before changing application code.
6. Tell the user the project expires seven days after creation, receives a warning after six days, and is deleted immediately if the lifecycle issue is closed.

Do not expose tokens, tenant IDs, subscription IDs, workspace IDs, or generated secrets in the response.

