# test-template
Template for Citizen Developers to use

## Hello World web app

A minimal Python web app (standard library only, no dependencies).

Run it:

```bash
python3 app.py
```

Then open http://127.0.0.1:8000 to see `Hello, World!`.

The host and port can be overridden with the `HOST` and `PORT` environment variables.

## Deployment

Pushes to `main` provision the Azure resources with Bicep, build and publish the
container image, and deploy it to Azure Container Apps. The resource group and shared
Azure Container Registry must already exist. The deployment creates the Container Apps
environment, managed identity, and Container App.

Configure these required GitHub Actions values:

- Repository variable `AZURE_RESOURCE_GROUP`: the pre-provisioned application resource group
- Repository variable `ACR_NAME`: the existing registry name, without `.azurecr.io`
- Repository variable `ACA_ACR_IDENTITY_ID`: the resource ID of the existing user-assigned identity with ACR pull access
- Repository variables `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, and `AZURE_SUBSCRIPTION_ID`

The Azure identity must use federated credentials for this repository and be able to
deploy resources in the application resource group and push images to the registry.
The identity specified by `ACA_ACR_IDENTITY_ID` and its ACR pull role assignment must
be provisioned separately. Container sizing and scaling are fixed in
[the resource template](infra/resources.bicep).
