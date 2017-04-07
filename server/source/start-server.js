var BandcampApi = require("./bandcamp");
var Cache = require("./album-cache");
var Database = require("./database");
var CacheUpdater = require("./cache-updater");
var Recacher = require("./re-cacher");
var Seeder = require("./seeder");
var Config = require("./config");

var logFunction = function(text) { console.log(new Date().toISOString() + ": " + text) };
var config = new Config();
var bandcamp = new BandcampApi(logFunction);
var database = new Database();
var updater = new CacheUpdater(bandcamp, database, logFunction);
var recacher = new Recacher(database, updater, logFunction);
var seeder = new Seeder(bandcamp, logFunction);

require("./server")
	.start(
		config,
		database,
		updater,
		recacher,
		seeder,
		logFunction)
    .then(() => logFunction("Server listening on port " + config.port))
	.catch(error => logFunction("Unable to start server because " + error));