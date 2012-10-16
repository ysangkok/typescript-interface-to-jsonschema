///<reference path='typescript.ts' />
///<reference path='node.d.ts' />

module TSIFaceJSONSchema {

var sys = require("sys");
var assert = require("assert");

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

export function extractSchemas(typeScriptSrc) { // argument is string or node.js module object
	var src = typeScriptSrc;
	if (typeof src.filename !== "undefined") {
		src = require("fs").readFileSync(src.filename.split(".")[0] + ".ts", "utf-8");
	}
	
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

export function typeCheck(JSVenv, args, schemas, ifaces) {
	var i = 0;
	ifaces.forEach(function(v) {
		if (!v) { i++; return; }
		var candidate_schemas = schemas.filter(function(w){ return w.description === v; });
		if (candidate_schemas.length === 0) throw new Error("unknown interface " + v);
		var schema = candidate_schemas[0];
		var res = JSVenv.validate(args[i], schema);
		assert.ok(res.errors.length === 0, "Runtime typecheck failed on argument number " + (i+1) + ": Value: " + sys.inspect(args[i]) + ", Schema: " + JSON.stringify(schema) + ", Error reports (length " + res.errors.length + "): " + sys.inspect(res.errors));
		i++;
	});
}

}
