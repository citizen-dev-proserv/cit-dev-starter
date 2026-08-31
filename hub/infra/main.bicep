targetScope = 'subscription'

@description('Azure region for the shared resource group and container registry.')
param location string

@description('Name of the shared resource group.')
param resourceGroupName string = 'rg-citizen-dev-shared'

@description('Globally unique name of the shared Azure Container Registry.')
@minLength(5)
@maxLength(50)
param containerRegistryName string = 'citdev${uniqueString(subscription().id)}'

@description('Azure Container Registry SKU.')
@allowed([
  'Basic'
  'Standard'
  'Premium'
])
param containerRegistrySku string = 'Standard'

@description('Tags applied to the shared resources.')
param tags object = {
  managedBy: 'central-hub'
  purpose: 'citizen-development'
}

resource sharedResourceGroup 'Microsoft.Resources/resourceGroups@2024-11-01' = {
  name: resourceGroupName
  location: location
  tags: tags
}

module containerRegistry 'modules/container-registry.bicep' = {
  name: 'shared-container-registry'
  scope: sharedResourceGroup
  params: {
    name: containerRegistryName
    location: location
    sku: containerRegistrySku
  }
}

output resourceGroupId string = sharedResourceGroup.id
output containerRegistryId string = containerRegistry.outputs.id
output containerRegistryLoginServer string = containerRegistry.outputs.loginServer
