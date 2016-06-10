var Cache = require("./album-cache");
var CacheUpdater = require("./cache-updater");
var BandcampApi = require("../server/bandcamp");
var Seeder = require("./seeder");

var cache = new Cache();
var bandcamp = new BandcampApi();
var updater = new CacheUpdater(cache, bandcamp, function(text) { console.log(text); });

require("./server")
	.start(
		cache,
		updater,
		function() { console.log("Server listening on: http://localhost")});

var seeder = new Seeder(updater, bandcamp);
seeder.seed("svensk");