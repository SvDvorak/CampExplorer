var Cache = require("./album-cache");
var CacheUpdater = require("./cache-updater");
var BandcampApi = require("../server/bandcamp");
var Recacher = require("../server/re-cacher");
var Seeder = require("./seeder");

var cache = new Cache();
var bandcamp = new BandcampApi();
var updater = new CacheUpdater(cache, bandcamp, function(text) { console.log(text); });
var recacher = new Recacher(cache, updater);

require("./server")
	.start(
		cache,
		updater,
		recacher,
		function() { console.log("Server listening on: http://localhost")});

var seeder = new Seeder(updater, bandcamp);
//seeder.seed("svensk");