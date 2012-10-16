///<reference path='node.d.ts' />

var ijjp = require("./ifacejsonjsproxy")
var typeCheck = ijjp.typeCheck;
var schemas = ijjp.extractSchemas(module);

var JSVenv = require("JSV").JSV.createEnvironment();

enum Color {
	BLACK,
	RED
}

interface PhysicalObject { color : Color; intact : bool; weight : number; }

class Car implements PhysicalObject {
	public intact = true;
	constructor(public color : Color, public weight : number) {};
}

function scratch(aCar : Car) {
	typeCheck(JSVenv, arguments, schemas, ["PhysicalObject"]);
	console.log("Scratching the car!");
	aCar.intact = false;
}

scratch(new Car(Color.BLACK, 4.2));
eval("scratch(new Car(Color.BLACK, 'four'));");
eval("scratch(69);");
eval("scratch({ intact: 42, color: Color.RED });");
