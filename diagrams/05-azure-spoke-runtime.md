# 5. Azure spoke runtime

The Azure template separates deployment authority from runtime image-pull authority.

```mermaid
flowchart LR
    User["Application user"]

    subgraph GitHub["Generated GitHub repository"]
        Main["main branch"]
        Workflow["deploy.yml"]
        Vars["Repository variables<br/>tenant, subscription, RG, ACR, identities"]
        Source["Python app + Dockerfile"]
        IaC["Bicep<br/>Container Apps environment + app"]
    end

    subgraph Identity["Microsoft Entra ID"]
        OIDC["GitHub OIDC trust<br/>repo and main branch bound"]
        DeployID["id-gh-repositoryId<br/>deployment identity"]
        PullID["id-aca-repositoryId<br/>runtime pull identity"]
    end

    subgraph SharedAzure["Shared Azure resource group"]
        ACR["Azure Container Registry<br/>ABAC repository permissions"]
        Image["citizen-dev/repository<br/>SHA + latest tags"]
    end

    subgraph ProjectAzure["Dedicated project resource group"]
        Env["Container Apps environment"]
        App["Container App<br/>external ingress port 8000<br/>0 to 3 replicas"]
    end

    Main --> Workflow
    Source --> Workflow
    IaC --> Workflow
    Vars --> Workflow
    Workflow --> OIDC
    OIDC --> DeployID
    DeployID -->|"Contributor"| ProjectAzure
    DeployID -->|"Conditional Writer"| ACR
    Workflow --> Image
    Image --> ACR
    IaC --> Env
    IaC --> App
    Env --> App
    PullID -->|"Conditional Reader"| ACR
    App --> PullID
    ACR -->|"container pull"| App
    User -->|"HTTPS"| App

    classDef github fill:#dbeafe,stroke:#2563eb,color:#111;
    classDef azure fill:#dcfce7,stroke:#16803a,color:#111;
    classDef identity fill:#fef3c7,stroke:#d97706,color:#111;
    classDef user fill:#fff4cc,stroke:#8a6d00,color:#111;
    class Main,Workflow,Vars,Source,IaC github;
    class ACR,Image,Env,App azure;
    class OIDC,DeployID,PullID identity;
    class User user;
```

## Build and deployment path

1. A push to `main` starts the template's workflow.
2. Docker builds the dependency-free Python HTTP service.
3. GitHub Actions authenticates without a client secret by exchanging its OIDC token.
4. The workflow pushes both a commit-SHA tag and `latest` into the project's ACR repository path.
5. Bicep creates or updates the Container Apps environment and application.
6. The running Container App pulls the image using a different identity from the deployment identity.

## Runtime characteristics

- Non-root container user with UID `10001`.
- Python standard-library server on port `8000`.
- Public Container App ingress.
- Minimum replicas `0`; maximum replicas `3`.
- Shared ACR, but conditional role assignments limit both identities to one image repository path.

## Evidence

- [Dockerfile](../templates/test-template/Dockerfile)
- [Application](../templates/test-template/app.py)
- [Deployment workflow](../templates/test-template/.github/workflows/deploy.yml)
- [Container App resources](../templates/test-template/infra/resources.bicep)
- [Azure provisioning workflow](../hub/.github/workflows/provision-repository.yml)
