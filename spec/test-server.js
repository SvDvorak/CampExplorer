var server = require("../server/server");
var BandcampFake = require("./bandcamp-fake");
var Cache = require("../server/album-cache");
var CacheUpdater = require("../server/cache-updater");
var Recacher = require("../server/re-cacher");
var config = require("./config");

module.exports = TestServer = function() {
    this.bandcamp = new BandcampFake();
    this.cache = new Cache();
    this.updater = new CacheUpdater(this.cache, this.bandcamp);
    this.recacher = new Recacher(this.cache, this.updater);
};

TestServer.prototype = {
	start: function(done) {
        server.start(config, this.cache, this.updater, this.recacher, done);
	},

	stop: function(done) {
		if(server.isRunning) {
            server.stop(done);
        }
        else {
            done();
        }
	}
}