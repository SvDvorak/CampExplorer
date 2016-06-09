var Cache = require("./album-cache");
var CacheUpdater = require("./cache-updater");
var BandcampApi = require("../server/bandcamp");

var cache = new Cache();
var updater = new CacheUpdater(cache, new BandcampApi(), function(text) { console.log(text); });

require('./server')
	.start(
		cache,
		updater,
		function() { console.log("Server listening on: http://localhost")});
