var BandcampApi = require("./bandcamp");
var Database = require("./database");
var CacheUpdater = require("./cache-updater");
var Recacher = require("./re-cacher");
var Seeder = require("./seeder");
var TimeProvider = require("./time-provider");
var Config = require("./config");

var logFunction = function(text) { console.log(new Date().toISOString() + ": " + text) };
var config = new Config();
var bandcamp = new BandcampApi(logFunction);
var database = new Database();
var updater = new CacheUpdater(bandcamp, database, logFunction);
var recacher = new Recacher(database, updater, logFunction);
var seeder = new Seeder(bandcamp, logFunction);
var timeProvider = new TimeProvider();

require("./server")
	.start(
		config,
		database,
		updater,
		recacher,
		seeder,
		timeProvider,
		logFunction)
    .then(() => logFunction("Server listening on port " + config.port))
	.catch(error => logFunction("Unable to start server because " + error));