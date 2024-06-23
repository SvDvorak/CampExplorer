var sourceFolder = "../../";

var BandcampFake = require("../bandcamp-fake");
var DatabaseFake = require("../database-fake");
var CacheUpdater = require(sourceFolder + "cache-updater");
var TagRecacher = require(sourceFolder + "tag-re-cacher");
var AlbumRecacher = require(sourceFolder + "album-re-cacher");
var Seeder = require(sourceFolder + "seeder");
var TimeProvider = require(sourceFolder + "time-provider");
var Config = require("./config");

module.exports = TestServer = function(config) {
    if(config == undefined)
        config = new Config();
    this.server = require(sourceFolder + "server");
    this.noLog = _ => { };
    this.noTimeout = async _ => { };
    this.config = config;
    this.bandcamp = new BandcampFake(this.noLog);
    this.database = new DatabaseFake();
    this.updater = new CacheUpdater(this.bandcamp, this.database, this.noLog);
    this.tagRecacher = new TagRecacher(this.database, this.updater, this.noLog);
    this.albumRecacher = new AlbumRecacher(this.database, this.updater, this.noLog);
    this.seeder = new Seeder(this.bandcamp, this.noTimeout, this.noLog);
    this.timeProvider = new TimeProvider();
};

TestServer.prototype = {
	start: function() {
        return this.server.start(
            this.config,
            this.database,
            this.updater,
            this.albumRecacher,
            this.tagRecacher,
            this.seeder,
            this.timeProvider,
            this.noLog);
	},

	stop: async function() {
        await this.server.stop();
	}
}