---
name: update-project
description: "Safely change an existing governed citizen-development project. Use when a user asks to update, modify, fix, extend, customize, or deploy a project created by central-hub."
---

# Update a Project

Update application behavior in the generated project repository. Central Hub has no update workflow: it owns provisioning, protected configuration, expiry, and deletion. Keep the citizen developer focused on the desired business outcome while preserving those controls.

## Establish the target

Before editing:

1. Identify the exact `citizen-dev-proserv/<repository>` and local folder. Do not rely only on the current folder name.
2. Verify that repository variable `PROVISION_REQUEST` points to an open issue in `citizen-dev-proserv/central-hub` with a matching `citizen-dev-lifecycle` marker. If it does not, stop and explain that the project is not safely linked to the managed lifecycle.
3. Refuse to use this workflow on `central-hub`, an approved template repository, or an unmanaged repository. Those require an administrator workflow.
4. Check the lifecycle issue for an expiry warning. Tell the user before investing work in a project scheduled for deletion.
5. Read the repository's `README.md`, `AGENTS.md`, package/build files, and relevant bundled skills. Follow their version-specific guidance.
6. Inspect the current branch, uncommitted changes, and remote status. Never discard, overwrite, stash, or reset work without explicit permission.

If the project is not local, clone it only into a new or empty folder. If local and remote histories differ, pause before merging or rebasing.

## Clarify the change

Translate the request into a short acceptance check a nontechnical user can verify. Ask focused questions only when an answer changes data handling, authorization, destructive behavior, or the user experience.

Use conservative judgment:

- The infra and actions workflows can not be modified. Do not change protected files, paths, or settings.

## Protected boundaries

Do not edit, rename, remove, or work around centrally managed files:

- Every project: `.github/workflows/**`, GitHub rulesets, Actions secrets, generated identity settings, and lifecycle variables.
- Azure projects: `infra/**`.
- Rayfin projects: `rayfin/rayfin.yml`.

Application-owned Rayfin data models under `rayfin/data/**` may be changed when required, but validate schema compatibility and call out possible data loss. If the requested outcome requires a protected-file change, stop and route it to the platform administrators; do not disable a rule or use an alternate deployment path.

## Implement and verify


1. Explain what changed and any known limitation in plain language.
2. Push directly to main to kick off the deployment workflow. Do not merge a pull request or use a branch that is not the main branch. Pull first to avoid overwriting any other changes. If the workflow fails, do not retry until the failure is understood and fixed.

Local edits and validation are reversible and may proceed after the target is clear. Before pushing, opening a pull request, merging to `main`, or triggering a deployment, show the user the validation result and obtain explicit approval for that remote action. A push to `main` may deploy immediately.

If validation fails, do not deploy. Report the relevant failure and either fix the same change or leave the branch unmerged. Never silence checks to obtain a green result.