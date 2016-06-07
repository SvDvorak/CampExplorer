var Cache = require("./album-cache");
var bandcampApi = require("../server/bandcamp-fake");

var cache = new Cache(bandcampApi);

require('./server')
	.start(
		cache,
		function() { });
