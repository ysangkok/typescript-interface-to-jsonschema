var fs = require('fs');
var path = require('path');

var tsTempFile = null;
['TMPDIR', 'TMP', 'TEMP'].forEach(function(td) {
    if (!tsTempFile && process.env[td])
        tsTempFile = process.env[td];
});
tsTempFile = path.join((tsTempFile || "/tmp"), "ifacejson-jsproxy-tmp-" + Date.now() + ".js");

var contents = [
    "(function() {",
    fs.readFileSync(path.join(__dirname, "ifacejson.js"), "utf8"),
    "module.exports = TSIFaceJSONSchema;",
    "}).call({});"
].join("");
fs.writeFileSync(tsTempFile, contents, "utf-8");

module.exports = require(tsTempFile);

fs.unlinkSync(tsTempFile);
