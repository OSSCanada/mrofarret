const fs = require('fs');

class TFAzureResource {
	constructor(type, jsonObject) {
		this.uuid = jsonObject.id;
		this.name = jsonObject.name.replace(/\//g, '-');
		this.type = type;
		this.terraformId = `${this.type}.${this.name}`;
		this.originalJSON = jsonObject;
	}
	
	toTF(){
		const self = this.originalJSON;
		const startTF = `resource "${this.type}" "${self.name}" {`
		const endTF = `\n}`
		const tfObject = [];
	
		delete self.id;
		delete self.properties;
		delete self.managedBy;
		delete self.type;
		delete self.kind;
		
		tfObject.push(startTF);
		tfObject.push(this.terrarize(self));
		tfObject.push(endTF);
		
		return tfObject.join("");
	}	

	terrarize(azObject) {
		const tfObject = [];

		for (var property in azObject) {
			const value = azObject[property];
			const type = value.constructor.name.toLowerCase();
			const valueNotEmpty = (value.length || type == 'number' || Object.keys(value).length);
		
			if(azObject.hasOwnProperty(property) && value && valueNotEmpty){
				tfObject.push("\n\t");

				if(type == 'object') {
					if(Object.keys(value).length) {
						tfObject.push(`${property} {`);
						tfObject.push(`${this.terrarize(value)}`.split("\n").join("\n\t"));
						tfObject.push("\n\t}");
					}
				}
				else tfObject.push(`${property} = `);

				if(type == 'array') tfObject.push(`[${value}]`);

				if(type == 'string') tfObject.push(`"${value}"`);

				if(type == 'number') tfObject.push(`${value}`);
			}
		}

		return tfObject.join("");
	}

	saveToFile(){
		return new Promise((resolve, reject) => {
			const opts = 'utf8';
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