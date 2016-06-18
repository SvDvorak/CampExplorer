var BandcampApi = require("./bandcamp");
var Cache = require("./album-cache");
var CacheUpdater = require("./cache-updater");
var Recacher = require("./re-cacher");
var Persister = require("./cache-persister");
var Seeder = require("./seeder");
var InitialDataLoader = require("./initial-data-loader");
var Config = require("./config");
var readJson = require("./read-json");
var writeJson = require("./write-json");
var scheduleAt = require("./schedule-at");

var logFunction = function(text) { console.log(new Date().toISOString() + ": " + text) };
var config = new Config();
var cache = new Cache();
var bandcamp = new BandcampApi();
var updater = new CacheUpdater(cache, bandcamp, logFunction);
var recacher = new Recacher(cache, updater, logFunction);
var seeder = new Seeder(updater, bandcamp, logFunction);
var persister = new Persister(cache, writeJson, scheduleAt, config.persistPath, logFunction);
var seeder = new Seeder(updater, bandcamp, logFunction);
var initialDataLoader = new InitialDataLoader(config, readJson, cache, updater, seeder);

require("./server")
	.start(
		config,
		cache,
		updater,
		recacher,
		persister,
		initialDataLoader,
		function() { logFunction("Server listening on port " + config.port)	});