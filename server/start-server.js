var Cache = require("./album-cache");
var BandcampApi = require("../server/bandcamp");

var cache = new Cache(new BandcampApi());

require('./server')
	.start(
		cache,
		function() { console.log("Server listening on: http://localhost")});
