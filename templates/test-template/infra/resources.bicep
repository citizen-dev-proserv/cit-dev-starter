param imageName string
param imageTag string
param location string
param useLocationSuffix bool = false
param existingContainerAppName string = ''
param existingEnvironmentName string = ''
param acrLoginServer string
param acrPullIdentityId string

var resourceSuffix = useLocationSuffix ? uniqueString(resourceGroup().id, location) : uniqueString(resourceGroup().id)
var containerAppEnvironmentName = empty(existingEnvironmentName) ? 'cae-${resourceSuffix}' : existingEnvironmentName
var containerAppName = empty(existingContainerAppName) ? 'ca-${resourceSuffix}' : existingContainerAppName

resource environment 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: containerAppEnvironmentName
  location: location
  properties: {}
}

resource containerApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: containerAppName
  location: location
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${acrPullIdentityId}': {}
    }
  }
  properties: {
    managedEnvironmentId: environment.id
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: true
        targetPort: 8000
        transport: 'auto'
      }
      registries: [
        {
          server: acrLoginServer
          identity: acrPullIdentityId
        }
      ]
    }
    template: {
      containers: [
        {
          name: containerAppName
          image: '${acrLoginServer}/${imageName}:${imageTag}'
          resources: {
            cpu: json('0.25')
            memory: '0.5Gi'
          }
        }
      ]
      scale: {
        minReplicas: 0
        maxReplicas: 3
      }
    }
  }
}

output containerAppFqdn string = containerApp.properties.configuration.ingress.fqdn
