var Cache = require("./album-cache");
var CacheUpdater = require("./cache-updater");
var BandcampApi = require("../server/bandcamp");
var Recacher = require("../server/re-cacher");
var Seeder = require("./seeder");
var config = require("./config");

var cache = new Cache();
var bandcamp = new BandcampApi();
var updater = new CacheUpdater(cache, bandcamp, function(text) { console.log(text); });
var recacher = new Recacher(cache, updater);

require("./server")
	.start(
		config,
		cache,
		updater,
		recacher,
		function() { console.log("Server listening on port " + config.port)});

if(config.startSeed != undefined)
{
	var seeder = new Seeder(updater, bandcamp);
	seeder.seed(config.startSeed);	
}