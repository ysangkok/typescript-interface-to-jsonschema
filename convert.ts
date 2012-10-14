///<reference path='typescript.ts' />
///<reference path='node.d.ts' />

class StringSourceText implements TypeScript.ISourceText {
       private str: string;
       constructor(src) {
	 this.str = src;
       }
       getText(start: number, end: number): string { return this.str.substr(start,end); }
       getLength(): number { return this.str.length; }
}

class SimpleLogger implements TypeScript.ILogger {
        information(): bool { return false; };
        debug(): bool { return false; };
        warning(): bool { return false; };
        error(): bool { return false; };
        fatal(): bool { return false; };
        log(s: string): void { console.log(s); };
}

function errorCapture(minChar: number, charLen: number, message: string, unitIndex: number) {
	throw new Error("Runtime syntax error: Column " + minChar + ": " + message);
}

class Property {
	constructor(public name: string, public type: string, public required: bool = true) {};
	copy() : Property { return new Property(this.name, this.type, this.required); }
}

class JSONSchema { 
	constructor(public description: string, public properties: Property[]) {};
	toObject() : Object {
		var map = {};
		this.properties.forEach(function(property) {
			map[property.name] = property.copy();
			delete map[property.name].name;
			if (!map[property.name].required) delete map[property.name].required;
		});
		return {description: this.description, type: 'object', properties: map};
	};
}

function getJSONSchemas(typeScriptSrc) {
	var src = typeScriptSrc;
	
	var jsonschemas = [];
	
	var res = TypeScript.quickParse(new SimpleLogger(), null, new StringSourceText(src), 0, src.length, errorCapture);
	
	res.Script.bod.members.forEach(function(statement) {
		if (statement.nodeType !== TypeScript.NodeType.Interface) return;
	
		jsonschemas.push(new JSONSchema(
			statement["name"].text,
			statement["members"].members.map(function(property) {
				var required;
				switch (property.id.flags) {
					case 1028:
						required = false;
						break;
					case 4:
						required = true;
						break;
					default:
						throw new Error("unsupported flags " + property.id.flags);
						break;
				}
	
				return new Property(property.id.text, property.typeExpr.term.text, required);
			})
		));
	});
	
	return jsonschemas.map(function(v){return v.toObject();});
}

// demo code

var src = "interface duck { color: string; weight: number; age?: number; }\ninterface car { numberDoors: number; }";
var jsonSchemaObjects = getJSONSchemas(src);

console.log(jsonSchemaObjects.map(function(v){return JSON.stringify(v);}));

// VALIDATE SCHEMAS

var JSVenv = require("JSV").JSV.createEnvironment();

var obj1 = '{"color": "brown", "weight": 3.2, "age": 6.4}'; // this is a valid duck
var obj2 = '{"color": "brown", "weight": 3.2, "age": "four"}';
var obj3 = '{"numberDoors": "four"}';
var obj4 = '{"numberDoors": 3}'; // this is a valid car

[jsonSchemaObjects[0],jsonSchemaObjects[1]].forEach(function testSchema(schema) {
	console.log(
		[obj1, obj2, obj3, obj4].map(function objIsValid(obj) {
			var report = JSVenv.validate(JSON.parse(obj), schema);
	
			if (report.errors.length === 0) {
				return true; // valid
			} else {
				return false; // invalid
			}
		})
	);
});
// outputs:
//	[true, false, false, false]
//	[false, false, false, true]
