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
	
		let tfObject = startTF;
	
		delete self.id;
		delete self.properties;
		delete self.managedBy;
		delete self.type;
		delete self.kind;

		tfObject += this.terrarize(self)
		tfObject += endTF;
		
		return tfObject;
	}	

	terrarize(azObject) {
		const tfObject = [];

		for (var property in azObject) {
			const value = azObject[property]
			const type = value.constructor.name.toLowerCase();
			// const type = typeof(value);
		
			if(azObject.hasOwnProperty(property) && value){
				tfObject.push("\n\t");

				switch(type) {
					case 'array':
						if(value.length) {
							tfObject.push(`${property} = [${value}]`);
						};
						break;

					case 'string':
						tfObject.push(`${property} = "${value}"`);
						break;

					case 'number':
						tfObject.push(`${property} = ${value}`);
						break;

					case 'object':
						if(Object.keys(value).length) {
							tfObject.push(`${property} {`);
							tfObject.push(`${this.terrarize(value)}`.split("\n").join("\n\t"));
							tfObject.push("\n\t}");
						}
						else {
							// remove the new line and tab added before this object
							tfObject.splice(-1,1);
						}
						break;
				}	

				// if(type == 'object') {
				// 	if(Object.keys(value).length) {
				// 		tfObject += `${property} {`;
				// 		tfObject += `${this.terrarize(value)}`.split("\n").join("\n\t");
				// 		tfObject += "\n\t}"
				// 	}
				// }
				// else {
				// 	tfObject += `${property} = `
				// }

				// if(type == 'array') {
				// 	if(value.length) {
				// 		tfObject += `[${value}]`
				// 	};
				// }

				// if(type == 'string') {
				// 	tfObject += `"${value}"`
				// }

				// if(type == 'number') {
				// 	tfObject += `${value}`
				// }
			}
		}

		return tfObject.join("");
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