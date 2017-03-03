var Promise = require("bluebird");
var readFile = Promise.promisify(require("fs").readFile);
var readFileSync = require("fs").readFileSync;

module.exports = readJson = {
	async: function(path) {
		return readFile(path).then((data) => {
			return JSON.parse(data);
		});
	},

	sync: function(path) {
		var dataAsJson = readFileSync(path);
		return JSON.parse(dataAsJson);
	}
}