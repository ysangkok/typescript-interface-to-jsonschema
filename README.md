To run
------

1. ```sudo npm install -g typescript``` (if you havn't already)
1. ```sudo npm install -g JSV``` (needed for validation)
1. ```git clone https://git01.codeplex.com/typescript```
1. ```tsc --out ifacejson.js typescript/src/compiler/parser.ts convert.ts```
1. ```tsc example.ts```
1. ```node example.js```

A similar converter from TypeScript to JSON Schema, implemented in Java instead of JS,
can be found on https://github.com/vorburger/eclipse-typescript-xtext + https://github.com/lbovet/wtype.
