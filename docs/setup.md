# Setup
A step by step guide to setting up the hub-and-spoke platform. This setup includes two templates, one using rayfin and one with custom architecture on azure. [Rayfin](https://www.microsoft.com/en-us/microsoft-fabric/features/rayfin?msockid=286fc4ff072e64b023a4d3c7065065f8) is an open-source SDK for a fully managed, code-first backend on Microsoft Fabric. It manages much of the infrastructure and security for you but does not have the flexibility of a custom architecture. The custom architecture template is more flexible but requires more knowledge of azure and security.

## Overview
The initial setup creates the base resources and identities to provision citizen developer projects. These permissions are higher than those minted for citizen developer projects, which are only scoped to the project resources and potentially limited access to shared resources. The setup is intended to be run by a central team with the appropriate permissions and knowledge of azure and security.

## Azure Setup
1. A new azure subscription is recommended for the initial POC. Otherwise, pick an existing subscription.
2. Create a new resource group for the hub-and-spoke platform. This resource group will contain the hub repository resources and any shared resources.
3. Within the resource group, create a managed identity and assign it the following Azure role assignments:
   - Contributor on the subscription
   - Role Based Access Control (RBAC) on the subscription
   - Container Registry Repository Contributor on the resource group
4. Within the same resource group, create an Azure container registry (ACR) to store the docker images for the hub-and-spoke platform. This POC uses the ACR to demonstrate shared resource usage.  
5. Create federated credentials for the managed identity to allow it to be used in an actions workflow. This can be done at a later time if the GitHub repo has not been created yet. You will need the organization name+id and the repository name+id to create the federated credentials. The federated credentials will allow the GitHub actions workflow to use the managed identity to deploy resources in Azure. This demo uses "Entity" as main branch but a GitHub Environment is a better production practice. 
6. Save the azure client id, subscription id, tenant id, and resource group name for later use in the GitHub setup. These values will be used to configure the GitHub actions workflow to deploy resources in Azure.

## Fabric Setup
1. Provision a fabric capacity. If you have an existing capacity, that can be used instead as long as it is in a region that allows Fabric Apps (available regions: https://learn.microsoft.com/en-us/fabric/admin/region-availability).
2. Create a workspace and add the capacity. Store the workspace ID for later.
3. Fabric Apps are currently in preview. Navigate to the Fabric admin portal -> Tenant settings and enable "Enable Fabric Apps" for your tenant. This will allow you to create and manage Fabric apps in your workspace. 
4. Assign the managed identity created in the Azure setup to the Fabric workspace with the Admin role. This will allow the hub to grant contributor access to citizen developer project's managed identites.

## GitHub Setup
1. Create a new GitHub organization or use an existing one. The organization will contain the hub-and-spoke platform repository and any citizen developer project repositories.
2. Create a new repository as the hub. This repo will handle spoke project creation and management. Add this repo's code into the hub.
3. Create a fine-grained personal access token with access to the organization. It will read/write access to actions, actions variables, administration, contents, and secrets. It will also need read access to metadata which will be automatically added when the other permissions are added.
4. Add the required secrets and variables to the hub repository. The secrets and variables will be used in the GitHub actions workflow to deploy resources in Azure and Fabric. The required secrets and variables are:
Secrets:
   - ORG_PROVISIONING_TOKEN: The fine-grained personal access token created in step 3.
    - TEMPLATE_RAYFIN_WORKSPACE_ID: The workspace ID created in the Fabric setup.
Variables:
    - AZURE_CLIENT_ID: The client ID of the managed identity created in the Azure setup.
    - AZURE_SUBSCRIPTION_ID: The subscription ID of the azure subscription used in the Azure setup.
    - AZURE_TENANT_ID: The tenant ID of the azure subscription used in the Azure setup.
    - AZURE_SHARED_RESOURCE_GROUP: The shared resource group name created in the Azure setup.
    - AZURE_LOCATION: The location to provision the resource group and identity of spoke projects.
    - TEMPLATE_ACR_NAME: The name of the Azure container registry created in the Azure setup. This is used to store docker images for spoke projects.
Names of variables and secrets can be changed but the workflows will need to be updated to reflect the changes.

1. For every template in the templates directory, create a repo from the template and in setting of the repo, check the box for "Template repository". This will allow the hub to create new spoke projects from the template.

## Skill Setup
Currently there is only one skill, create-project. More will come soon. In the create-project skill, you will need to update the url to the url of your hub repo.