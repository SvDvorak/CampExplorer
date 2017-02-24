var fs = require("fs");

module.exports = writeJson = {
	async: function(path, data, done, onError) {
		var dataAsJson = JSON.stringify(data);
		fs.writeFile(path, dataAsJson, function(err) {
			if (err) {
				onError(err);
			}
			else {
				done();
			}
		});
	},

	sync: function(path, data) {
		var dataAsJson = JSON.stringify(data);
		fs.writeFileSync(path, dataAsJson);
	}
}