var InitialDataLoader = require("../server/initial-data-loader");
var Album = require("../api-types");

describe("initial data loader", function() {
	var sut;
	var config;
	var albumsCache;

	var calledPath;
	var seedTag;

	var diskCache;
	var seedResult;
	var updatedTags;

	beforeEach(function() {
		calledPath = undefined;

		diskCache = undefined;
		seedResult = undefined;
		updatedTags = undefined;

		var readFromDisk = { async: function(path, onResult, onError) {
			if(diskCache != undefined) {
				onResult(diskCache);
			}
			else {
				onError();
			}
			calledPath = path;
		} };

		albumsCache = { albums: { } };

		updater = {
			updateTags: function(tags, done) {
				updatedTags = tags;
				done();
			},
			isIdle: function() { return true; }
		};

		var seeder = { seed: function(tag, onResult) {
			seedTag = tag;
			onResult(seedResult);
		}};

		config = {
			persistPath: "path",
			startSeed: "tag"
		};

		sut = new InitialDataLoader(config, readFromDisk, albumsCache, updater, seeder);
	});

	it("loads from disk if path is set and file found", function() {
		var album = new Album("album");
		diskCache = { tag: [ album ] };

		sut.load(function() { });

		expect(calledPath).toBe(config.persistPath);
		expect(albumsCache.albums["tag"]).toEqual([ album ]);
		expect(seedTag).toBe(undefined);
	});

	it("runs seed with config tag if path isn't set", function() {
		config.persistPath = undefined;
		var album = new Album("album");
		diskCache = { tag: [ album ] };
		seedResult = [ "tag" ];

		sut.load(function() { });

		expect(seedTag).toBe(config.startSeed);
		expect(updatedTags).toEqual(seedResult);
	});

	it("runs seed if cache can't be found on disk", function() {
		diskCache = undefined;
		sut.load(function() { });

		expect(seedTag).toBe(config.startSeed);
	});

	it("calls done when finished loading cache", function() {
		var callbackCount = 0;
		sut.load(function() { callbackCount += 1; })

		expect(callbackCount).toBe(1);
	});

	it("calls done once when finished seeding even though updater runs its callback multiple times", function() {
		config.persistPath = undefined;

		var updateCount = 0;
		updater.updateTags = function(tags, done) {
			updateCount += 1;
			done();
			updateCount += 1;
			done();
		};

		updater.isIdle = function() {
			return updateCount == 2;
		}

		var callbackCount = 0;
		sut.load(function() { callbackCount += 1; })

		expect(callbackCount).toBe(1);
	});
});