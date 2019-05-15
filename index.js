const AzureCompute = require('@azure/arm-compute');
const AzureResources = require('@azure/arm-resources')
const MsRest = require('@azure/ms-rest-nodeauth');
const ClientID = process.env.ARM_CLIENT_ID;
const ClientSecret = process.env.ARM_CLIENT_SECRET;
const SubscriptionID = process.env.ARM_SUBSCRIPTION_ID;
const TenantID = process.env.ARM_TENANT_ID;
const FS = require('fs');


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

  client.resources.list()
  .then(result => {
    console.log(result.length)    
  })
  
})