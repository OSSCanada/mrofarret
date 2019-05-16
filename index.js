const AzureCompute = require('@azure/arm-compute');
const AzureResources = require('@azure/arm-resources')
const MsRest = require('@azure/ms-rest-nodeauth');

const FS = require('fs');

const ClientID = process.env.ARM_CLIENT_ID;
const ClientSecret = process.env.ARM_CLIENT_SECRET;
const SubscriptionID = process.env.ARM_SUBSCRIPTION_ID;
const TenantID = process.env.ARM_TENANT_ID;


const TFAzureResource = require('./lib/tfobj');

function getCredentials() { 
  return new Promise((resolve, reject) => {
    MsRest.loginWithServicePrincipalSecret(
      ClientID,
      ClientSecret,
      TenantID,
      (err, credentials) => {
        err ? reject(err) : resolve(credentials);
      }
    )
  })
}

getCredentials().then(credentials => {
  const client = new AzureResources.ResourceManagementClient(credentials, SubscriptionID);
  
  client.resourceGroups.list()
  .then(async (groups)=>{
    groups.forEach(async (group) => {
      const resourceGroup = new TFAzureResource('azurerm_resource_group', group);
    
      resourceGroup.saveToFile()

      const resources = await client.resources.listByResourceGroup(group.name);

      resources.forEach((resource) => {
        console.log(resource.name.replace(/\//g, '-'));
        resource.resource_group_name = "${" +  resourceGroup.terraformId + ".name}"

        const resourceObject = new TFAzureResource('azurerm_resource', resource);

        resourceObject.saveToFile()
          // .then(obj => console.log(obj))
          // .catch(err => console.log(err))
      })
    })
  })
})