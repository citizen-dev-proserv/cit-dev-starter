---
name: delete-project
description: "Safely retire and permanently delete a project managed by citizen-dev-proserv/central-hub. Use when a user asks to delete, remove, retire, decommission, clean up, or tear down a citizen-development project."
---

# Delete a Project

Deletion is permanent and is performed only by closing the project's provisioning issue in `citizen-dev-proserv/central-hub`. Closing that issue starts the managed cleanup workflow. Never delete the GitHub repository, Azure resource group, container images, Fabric item, identity, or role assignments directly.

## Hard stops

Refuse deletion when any of these checks fails:

- The target is `citizen-dev-proserv/central-hub`, a template repository, outside `citizen-dev-proserv`, or otherwise unmanaged.
- The lifecycle issue cannot be identified unambiguously.
- The bot's `citizen-dev-lifecycle` marker does not name the same repository and repository ID as the current target.
- The user has not provided exact-name confirmation in the current conversation.

Do not treat "yes," prior intent, issue assignment, repository ownership, an expiry warning, or an already-closed pull request as deletion confirmation.

## Verify scope and impact

Resolve the lifecycle issue from the target repository's `PROVISION_REQUEST` variable, then independently verify its title prefix:

- `[Create repository]` for an Azure project.
- `[Provision Rayfin]` for a Rayfin project.

Read the bot lifecycle comment and confirm the exact `owner/repository`, repository ID, and that the issue is open. Check recent repository activity, open pull requests, workflow runs, and the local working tree when available. Surface anything that looks like work the user may expect to keep.

Explain in plain language that deletion removes:

- the GitHub repository, branches, issues, pull requests, and unexported source history;
- the project's dedicated Azure resource group and managed identities;
- project container images for Azure projects; and
- the deployed Fabric/Rayfin project and its data for Rayfin projects.

The central-hub issue remains as the audit record. Reopening the issue does not restore deleted resources and may not stop cleanup once it has started.

## Preserve what matters

Ask whether code, data, or ownership must be retained. When retention is requested, stop deletion until the user verifies the backup or handoff. Do not claim a local clone is a complete backup of cloud data, GitHub issues, pull requests, secrets, or Fabric data.

Never copy secrets into a backup. For business-critical or production-like use, route retirement to the platform administrators rather than improvising a migration.

## Require exact confirmation

Present one final summary containing:

- exact repository and lifecycle issue;
- project type;
- the resources and data that will be removed;
- whether uncommitted work, open pull requests, recent deployments, or an expiry warning were found; and
- whether a requested backup or handoff was verified.

Then ask the user to type exactly:

```text
delete citizen-dev-proserv/<repository-name>
```

The text must match the lifecycle marker exactly, ignoring only surrounding whitespace. Do not normalize, autocomplete, or accept a partial match. Confirmation expires if the target or lifecycle issue changes.

## Trigger and monitor cleanup

After exact confirmation:

1. Add a short, non-sensitive comment recording the user-requested reason for retirement.
2. Close the verified provisioning issue with state reason `completed`. Do not close any other issue.
3. Monitor the matching delete workflow until completion. Azure and Rayfin projects use different cleanup workflows; let the issue title select the correct one.
4. Confirm success from the hub's deletion comment and verify the repository no longer exists.
5. If cleanup fails, keep the lifecycle record intact, provide the workflow link and failed stage, and route the failure to a platform administrator. Do not manually delete the remaining pieces or repeatedly close/reopen the issue.

If the issue is already closed, do not trigger another deletion. Inspect the existing workflow and report whether cleanup completed or requires administrator attention.