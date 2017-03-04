var Promise = require("bluebird");
var writeFile = Promise.promisify(require("fs").writeFile);
var writeFileSync = require("fs").writeFileSync;

module.exports = writeJson = {
	async: function(path, data) {
		var dataAsJson = JSON.stringify(data);
		return writeFile(path, dataAsJson);
	},

	sync: function(path, data) {
		var dataAsJson = JSON.stringify(data);
		writeFileSync(path, dataAsJson);
	}
}