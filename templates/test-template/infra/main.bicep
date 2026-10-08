targetScope = 'resourceGroup'

@description('Container image repository name in ACR.')
param imageName string

@description('Container image tag to deploy.')
param imageTag string

@description('Azure region for the Container Apps environment and app.')
param location string

@description('Use a location-specific resource suffix for a fallback region.')
param useLocationSuffix bool = false

@description('Existing Container App name to preserve across deployments.')
param existingContainerAppName string = ''

@description('Existing managed environment name to preserve across deployments.')
param existingEnvironmentName string = ''

param acrLoginServer string
param acrPullIdentityId string

@description('Value for the PROVISIONED_BY cost-management tag.')
param provisionedBy string

module application 'resources.bicep' = {
  name: 'application-${uniqueString(resourceGroup().id, imageTag, location)}'
  params: {
    imageName: imageName
    imageTag: imageTag
    location: location
    useLocationSuffix: useLocationSuffix
    existingContainerAppName: existingContainerAppName
    existingEnvironmentName: existingEnvironmentName
    acrLoginServer: acrLoginServer
    acrPullIdentityId: acrPullIdentityId
    provisionedBy: provisionedBy
  }
}

output containerAppUrl string = 'https://${application.outputs.containerAppFqdn}'
