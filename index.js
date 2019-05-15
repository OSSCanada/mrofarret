const AzureCompute = require('@azure/arm-compute');
const AzureResources = require('@azure/arm-resources')
const MsRest = require('@azure/ms-rest-nodeauth');
const ClientID = process.env.ARM_CLIENT_ID;
const ClientSecret = process.env.ARM_CLIENT_SECRET;
const SubscriptionID = process.env.ARM_SUBSCRIPTION_ID;
const TenantID = process.env.ARM_TENANT_ID;
const debug = process.env.DEBUG || false;
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

function toTfObject(azObject){
  const startTF = `resource "${azObject.armResourceType}" "${azObject.name}" {`
  const endTF = `}`
  let tfObject = startTF + "\n";

  delete azObject.id;
  delete azObject.armResourceType;
  delete azObject.managedBy;
  
  for (var property in azObject) {   
    const type = azObject[property].constructor;

    if(azObject.hasOwnProperty(property)){
      switch(type) {
        case Object:
          break;
        default:
          tfObject += objectify(property, azObject[property])
      }
    }
  }

  tfObject += endTF;

  if(debug){
    console.log(tfObject);
  }

  return tfObject;
}

function objectify(property, value) {
  return "\t" + `${property} = "${value}"` + "\n";
}

getCredentials().then(credentials => {
  const client = new AzureResources.ResourceManagementClient(credentials, SubscriptionID);

  client.resourceGroups.list()
  .then((groups)=>{
    groups.forEach((group, index) => {
      group.armResourceType = 'azurerm_resource_group';
      toTfObject(group);
    })
  })
})