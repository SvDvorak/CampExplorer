var fs = require("fs");

module.exports = function(path) {
    try {
        fs.unlinkSync(path);
    }
    catch(err) {
        console.log("No file");
    }
}