var sourceFolder = "../../source/";

var BandcampFake = require("../bandcamp-fake");
var Cache = require(sourceFolder + "album-cache");
var CacheUpdater = require(sourceFolder + "cache-updater");
var Recacher = require(sourceFolder + "re-cacher");
var Persister = require(sourceFolder + "cache-persister");
var Seeder = require(sourceFolder + "seeder");
var InitialDataLoader = require(sourceFolder + "initial-data-loader");
var Config = require("./config");
var readJson = require(sourceFolder + "read-json");
var writeJson = require(sourceFolder + "write-json");
var scheduleAt = require(sourceFolder + "schedule-at");

module.exports = TestServer = function() {
    this.server = require(sourceFolder + "server");
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
	start: function() {
        return this.server.start(
            this.config,
            this.cache,
            this.updater,
            this.recacher,
            this.persister,
            this.initialDataLoader);
	},

	stop: function() {
        return this.server.stop();
	}
}
