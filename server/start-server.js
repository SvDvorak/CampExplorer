var Cache = require("./album-cache");
var CacheUpdater = require("./cache-updater");
var BandcampApi = require("../server/bandcamp");
var Recacher = require("../server/re-cacher");
var Seeder = require("./seeder");
var config = require("./config");

var logFunction = function(text) { console.log(new Date().toISOString() + ": " + text) };
var cache = new Cache();
var bandcamp = new BandcampApi();
var updater = new CacheUpdater(cache, bandcamp, logFunction);
var recacher = new Recacher(cache, updater, logFunction);
var seeder = new Seeder(updater, bandcamp, logFunction);

require("./server")
	.start(
		config,
		cache,
		updater,
		recacher,
		function() { logFunction("Server listening on port " + config.port)	});