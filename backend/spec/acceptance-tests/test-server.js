var sourceFolder = "../../";

var BandcampFake = require("../bandcamp-fake");
var DatabaseFake = require("../database-fake");
var CacheUpdater = require(sourceFolder + "cache-updater");
var Recacher = require(sourceFolder + "re-cacher");
var Seeder = require(sourceFolder + "seeder");
var TimeProvider = require(sourceFolder + "time-provider");
var Config = require("./config");

module.exports = TestServer = function() {
    this.server = require(sourceFolder + "server");
    this.noLog = text => { };
    this.noTimeout = async time => { };
    this.config = new Config();
    this.bandcamp = new BandcampFake(this.noLog);
    this.database = new DatabaseFake();
    this.updater = new CacheUpdater(this.bandcamp, this.database, this.noLog);
    this.recacher = new Recacher(this.database, this.updater, this.noLog);
    this.seeder = new Seeder(this.bandcamp, this.noTimeout, this.noLog);
    this.timeProvider = new TimeProvider();
};

TestServer.prototype = {
	start: function() {
        return this.server.start(
            this.config,
            this.database,
            this.updater,
            this.recacher,
            this.seeder,
            this.timeProvider,
            this.noLog);
	},

	stop: function() {
        return this.server.stop();
	}
}