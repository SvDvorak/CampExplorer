var BandcampFake = require("./bandcamp-fake");
var Cache = require("../server/album-cache");
var CacheUpdater = require("../server/cache-updater");
var Recacher = require("../server/re-cacher");
var Persister = require("../server/cache-persister");
var Seeder = require("../server/seeder");
var InitialDataLoader = require("../server/initial-data-loader");
var readJson = require("../server/read-json");
var writeJson = require("../server/write-json");
var scheduleAt = require("../server/schedule-at");
var config = require("./config");

module.exports = TestServer = function() {
    this.server = require("../server/server");
    var noLog = function(text) { };
    this.config = config;
    this.bandcamp = new BandcampFake();
    this.cache = new Cache();
    this.updater = new CacheUpdater(this.cache, this.bandcamp, noLog);
    this.recacher = new Recacher(this.cache, this.updater, noLog);
    this.persister = new Persister(this.cache, writeJson, scheduleAt, config.persistPath, noLog);
    this.seeder = new Seeder(this.updater, this.bandcamp, noLog);
    this.initialDataLoader = new InitialDataLoader(config, readJson, this.cache, this.updater, this.seeder);
};

TestServer.prototype = {
	start: function(done) {
        this.server.start(
            config,
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