const fs = require('fs');

class TFAzureResource {
  constructor(type, jsonObject) {
    this.uuid = jsonObject.id;
    this.name = jsonObject.name;
    this.type = type;
    this.terraformId = `${this.type}.${this.name}`;
    this.originalJSON = jsonObject;
  }

  toTF(){
    const azObject = this.originalJSON;
    const startTF = `resource "${this.type}" "${azObject.name}" {`
    const endTF = `}`
    let tfObject = startTF + "\n";
  
    delete azObject.id;
    delete azObject.properties;
    delete azObject.managedBy;

    tfObject += this.terrarize(azObject)
    tfObject += endTF;
    
    return tfObject;
  }  

  terrarize(azObject) {
    for (var property in azObject) {   
      const type = azObject[property].constructor;
  
      if(azObject.hasOwnProperty(property)){
        switch(type) {
          case Object:
            break;
          default:
            tfObject += this.terrarize(property, azObject[property])
        }
      }
    }
  
    return "\t" + `${property} = "${value}"` + "\n";
  }

  saveToFile(){
    return new Promise((resolve, reject) => {
      let opts = 'utf8';
      const dir = `./output`
      const data = this.toTF();

      if(!fs.existsSync(dir)) fs.mkdirSync(dir);

      
      fs.writeFile(dir + `/${this.type}.${this.name}.tf`, data, opts, (err) => {
        if(err) reject(err)
        else resolve(data)
      })
    });
  }
}


module.exports = TFAzureResource;