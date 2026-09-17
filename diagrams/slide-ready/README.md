# Slide-ready flow diagrams

These are presentation-scale technical architecture views. They retain the identities, trust boundaries, protected repository surfaces, deployment components, and cleanup paths needed to explain how the platform works, while limiting each slide to one coherent story.

| Diagram | Suggested slide title | Source | PowerPoint asset |
| --- | --- | --- | --- |
| Platform architecture | Control plane, project identity, deployment target, and lifecycle feedback | [Mermaid](01-platform-flow.mmd) | [SVG](01-platform-flow.svg) |
| Azure deployment architecture | GitHub, OIDC identities, ABAC-scoped ACR access, and Container Apps | [Mermaid](02-azure-project-flow.mmd) | [SVG](02-azure-project-flow.svg) |
| Rayfin deployment architecture | Repository deployment, federated identity, Fabric role, and AppBackend services | [Mermaid](03-rayfin-project-flow.mmd) | [SVG](03-rayfin-project-flow.svg) |
| Managed lifecycle | Metadata-driven expiry and type-specific Azure or Rayfin cleanup | [Mermaid](04-managed-lifecycle.mmd) | [SVG](04-managed-lifecycle.svg) |
| Governance boundaries | Platform-owned controls, editable surfaces, protected surfaces, and cloud trust | [Mermaid](05-governance-flow.mmd) | [SVG](05-governance-flow.svg) |

## PowerPoint guidance

- Insert the SVG directly so it remains sharp when resized.
- Use a blank or title-only widescreen layout and allow most of the slide body for the diagram.
- Keep the diagram at roughly 11.8 inches wide or less, leaving at least 0.5-inch slide margins.
- Use the suggested slide title above the diagram rather than adding explanatory bullets beside it.
- Add detailed explanations in speaker notes or use the corresponding full diagram from the parent folder.

## Visual language

- Navy: human request or platform entry point.
- Blue: GitHub control plane and repositories.
- Teal: automation, identity, and deployment.
- Green: running application or successful end state.
- Amber: warning or lifecycle decision.
- Red: destructive cleanup.
