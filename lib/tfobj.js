class TFAzureResource {
  constructor(json) {
    this.jsonObject = json;
  }

  objectify(property, value) {
    return "\t" + `${property} = "${value}"` + "\n";
  }
}


module.exports.TFAzureResource = TFAzureResource;