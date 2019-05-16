const AzureResources = require('@azure/arm-resources')
const MsRest = require('@azure/ms-rest-nodeauth');

const ClientID = process.env.ARM_CLIENT_ID;
const ClientSecret = process.env.ARM_CLIENT_SECRET;
const SubscriptionID = process.env.ARM_SUBSCRIPTION_ID;
const TenantID = process.env.ARM_TENANT_ID;


const TFAzureResource = require('./lib/tfobj').default;

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

async function main() {
  const credentials = await getCredentials();
  const client = new AzureResources.ResourceManagementClient(credentials, SubscriptionID);
  const groups = await client.resourceGroups.list()
    
  groups.forEach(async (group) => {
    const resourceGroup = new TFAzureResource('azurerm_resource_group', group);
  
    resourceGroup.saveToFile()

    const resources = await client.resources.listByResourceGroup(group.name);

    resources.forEach((resource) => {
      resource.resource_group_name = "${" +  resourceGroup.terraformId + ".name}"
    

      const resourceObject = new TFAzureResource('azurerm_resource', resource);

      return resourceObject.saveToFile()
    })
  })
}

main();