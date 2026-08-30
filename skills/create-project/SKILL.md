---
name: create-project
description: 'Create a new project based on a template. Use for starting a new project that includes a github repo, CI/CD, and architecture scaffolding.'
---

# Create a New Project
There are two seperate issues to create a project. The first is for applications using azure for deployment. The second issue uses rayfin. It will be citizen developers who create the project and use this skill. Therefore, the skill is used to hide technical details of creating a project and allow the citizen developer to focus on the business problem they are trying to solve. Project provisioning is started by creating a github issue that provisions all resources. You will need to monitor the issue and then clone in the repo to the users machine once the issue is complete.

The repo is located at https://github.com/citizen-dev-proserv/central-hub. With the organzization named citizen-dev-proserv and the repo named central-hub. The repo contains a number of templates for creating new projects. 

## Create a New Project Using Azure
The following is the issue template used to create a new project using azure. 
```
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

The inputs of each must meet the provided selections. For the underlying workflow to run the title must start with "[Create repository]". The workflow will create a new repo in the citizen-dev-proserv organization based on the selected template. The workflow will comment in the issue with a link to the issue. You must help the user clone that repository to their local machine.


## Create a New Project Using Fabric
The following is the issue template used to create a new project using Fabric. 
```
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

The inputs of each must meet the provided selections. For the underlying workflow to run the title must start with "[Provision Rayfin]". The workflow will create a new repo in the citizen-dev-proserv organization based on the selected template. The workflow will comment in the issue with a link to the issue. You must help the user clone that repository to their local machine.