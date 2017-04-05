var sourceFolder = "../../source/";

var BandcampFake = require("../bandcamp-fake");
var DatabaseFake = require("../database-fake");
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
    this.bandcamp = new BandcampFake(noLog);
    this.database = new DatabaseFake();
    this.updater = new CacheUpdater(this.bandcamp, this.database, noLog);
    this.recacher = new Recacher(this.database, this.updater, noLog);
    this.seeder = new Seeder(this.bandcamp, noLog);
};

TestServer.prototype = {
	start: function() {
        return this.server.start(
            this.config,
            this.database,
            this.updater,
            this.recacher,
            this.seeder);
	},

	stop: function() {
        return this.server.stop();
	}
}
