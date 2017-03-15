var Promise = require("bluebird");
var InitialDataLoader = require("../source/initial-data-loader");
var Album = require("../source/api-types");
var EmptyMatcher = require("./empty-matcher");
require("./test-finished");

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
		jasmine.addMatchers(EmptyMatcher);
		calledPath = undefined;

		diskCache = undefined;
		seedResult = undefined;
		updatedTags = undefined;

		var readFromDisk = { async: function(path) {
			return new Promise((resolve, reject) => {
				if(diskCache != undefined) {
					resolve(diskCache);
				}
				else {
					reject();
				}
				calledPath = path;
			})
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
			if(tag == undefined) {
				throw "Undefined seed tag";
			}
			seedTag = tag;
			onResult(seedResult);
		}};

		config = {
			persistPath: "path",
			startSeed: "tag"
		};

		sut = new InitialDataLoader(config, readFromDisk, albumsCache, updater, seeder);
	});

	it("loads from disk if path is set and file found", function(done) {
		var album = new Album("0", "album");
		diskCache = { tag: [ album ] };
		
		sut
			.load()
			.then(() => {
				expect(calledPath).toBe(config.persistPath);
				expect(albumsCache.albums["tag"]).toEqual([ album ]);
				expect(seedTag).toBe(undefined);
			})
			.testFinished(done);
	});

	it("runs seed with config tag if path isn't set", function(done) {
		config.persistPath = undefined;
		var album = new Album("0", "album");
		diskCache = { tag: [ album ] };
		seedResult = [ "tag" ];

		sut
			.load()
			.then(() => {
				expect(seedTag).toBe(config.startSeed);
				expect(updatedTags).toEqual(seedResult);
			})
			.testFinished(done);
	});

	it("runs seed if cache can't be found on disk", function(done) {
		diskCache = undefined;
		sut
			.load()
			.then(() => expect(seedTag).toBe(config.startSeed))
			.testFinished(done);
	});

	it("does nothing if start seed is undefined", function(done) {
		config.persistPath = undefined;
		config.startSeed = undefined;

		sut
			.load()
			.then(() => {
				expect(albumsCache.albums).toBeEmpty();
				expect(seedTag).tobe
			})
			.testFinished(done);
	});
});