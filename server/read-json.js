var fs = require("fs");

module.exports = readJson = {
	async: function(path, onResult, onError) {
		fs.readFile(path, function(err, data) {
			if (err) {
				onError(err)
			}
			else {
				onResult(JSON.parse(data));
			}
		});
	},

	sync: function(path) {
		var dataAsJson = fs.readFileSync(path);
		return JSON.parse(dataAsJson);
	}
}