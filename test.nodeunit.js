exports.testMatchIFace = function(test) {

var extractSchemas = require("./ifacejsonjsproxy").extractSchemas;

var src = "interface duck { color: string; weight: number; age?: number; }\ninterface car { numberDoors: number; }";
var jsonSchemaObjects = extractSchemas(src);

console.log(jsonSchemaObjects.map(function(v){return JSON.stringify(v);}));

// VALIDATE SCHEMAS

var JSVenv = require("JSV").JSV.createEnvironment();

var obj1 = '{"color": "brown", "weight": 3.2, "age": 6.4}'; // this is a valid duck
var obj2 = '{"color": "brown", "weight": 3.2, "age": "four"}';
var obj3 = '{"numberDoors": "four"}';
var obj4 = '{"numberDoors": 3}'; // this is a valid car

[[jsonSchemaObjects[0],[true, false, false, false]],[jsonSchemaObjects[1],[false, false, false, true]]].forEach(function testSchema(tuple) {
	var schema = tuple[0];
	var expected = tuple[1];
        test.deepEqual(
                [obj1, obj2, obj3, obj4].map(function objIsValid(obj) {
                        var report = JSVenv.validate(JSON.parse(obj), schema);
        
                        if (report.errors.length === 0) {
                                return true; // valid
                        } else {
                                return false; // invalid
                        }
                })
        , expected);
});

test.done();

};
