var serverFolder = "../../server/";

var BandcampFake = require("../bandcamp-fake");
var Cache = require(serverFolder + "album-cache");
var CacheUpdater = require(serverFolder + "cache-updater");
var Recacher = require(serverFolder + "re-cacher");
var Persister = require(serverFolder + "cache-persister");
var Seeder = require(serverFolder + "seeder");
var InitialDataLoader = require(serverFolder + "initial-data-loader");
var Config = require("./config");
var readJson = require(serverFolder + "read-json");
var writeJson = require(serverFolder + "write-json");
var scheduleAt = require(serverFolder + "schedule-at");

module.exports = TestServer = function() {
    this.server = require("../../server/server");
    var noLog = function(text) { };
    this.config = new Config();
    this.bandcamp = new BandcampFake();
    this.cache = new Cache();
    this.updater = new CacheUpdater(this.cache, this.bandcamp, noLog);
    this.recacher = new Recacher(this.cache, this.updater, noLog);
    this.persister = new Persister(this.cache, writeJson, scheduleAt, this.config.persistPath, noLog);
    this.seeder = new Seeder(this.updater, this.bandcamp, noLog);
    this.initialDataLoader = new InitialDataLoader(this.config, readJson, this.cache, this.updater, this.seeder);
};

TestServer.prototype = {
	start: function(done) {
        this.server.start(
            this.config,
            this.cache,
            this.updater,
            this.recacher,
            this.persister,
            this.initialDataLoader,
            done);
	},

	stop: function(done) {
		if(this.server.isRunning) {
            this.server.stop(done);
        }
        else {
            done();
        }
	}
}