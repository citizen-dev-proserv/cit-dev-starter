targetScope = 'resourceGroup'

@description('Container image repository name in ACR.')
param imageName string

@description('Container image tag to deploy.')
param imageTag string


param acrLoginServer string
param acrPullIdentityId string

module application 'resources.bicep' = {
  name: 'application-${uniqueString(resourceGroup().id, imageTag)}'
  params: {
    imageName: imageName
    imageTag: imageTag
    acrLoginServer: acrLoginServer
    acrPullIdentityId: acrPullIdentityId
  }
}

output containerAppUrl string = 'https://${application.outputs.containerAppFqdn}'
