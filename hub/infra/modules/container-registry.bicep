@description('Name of the Azure Container Registry.')
param name string

@description('Azure region for the registry.')
param location string

@description('Azure Container Registry SKU.')
param sku string

resource registry 'Microsoft.ContainerRegistry/registries@2025-11-01' = {
  name: name
  location: location
  sku: {
    name: sku
  }
  properties: {
    adminUserEnabled: false
    anonymousPullEnabled: false
    publicNetworkAccess: 'Enabled'
    roleAssignmentMode: 'AbacRepositoryPermissions'
    policies: {
      azureADAuthenticationAsArmPolicy: {
        status: 'enabled'
      }
    }
  }
}

output id string = registry.id
output loginServer string = registry.properties.loginServer
