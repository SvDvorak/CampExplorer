var Promise = require("bluebird");
var InitialDataLoader = require("../source/initial-data-loader");
var Album = require("../source/api-types");

var emptyMatcher = {
	toBeEmpty: function(util, customEqualityTesters) {
		return {
			compare: function(actual, expected) {
				if (expected === undefined) {
					expected = '';
				}

				var result = {};

				result.pass = util.equals(Object.keys(actual).length, 0, customEqualityTesters);

				if(result.pass)	{
					result.message = "Object is empty";
				}
				else {
					result.message = "Expected " + actual + " to be empty";
				}

				return result;
			}
		}
	}
}

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
		jasmine.addMatchers(emptyMatcher);
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
		var album = new Album("album");
		diskCache = { tag: [ album ] };
		
		sut
			.load()
			.then(() => {
				expect(calledPath).toBe(config.persistPath);
				expect(albumsCache.albums["tag"]).toEqual([ album ]);
				expect(seedTag).toBe(undefined);
			})
			.then(done);
	});

	it("runs seed with config tag if path isn't set", function(done) {
		config.persistPath = undefined;
		var album = new Album("album");
		diskCache = { tag: [ album ] };
		seedResult = [ "tag" ];

		sut
			.load()
			.then(() => {
				expect(seedTag).toBe(config.startSeed);
				expect(updatedTags).toEqual(seedResult);
			})
			.then(done);
	});

	it("runs seed if cache can't be found on disk", function(done) {
		diskCache = undefined;
		sut
			.load()
			.then(() => expect(seedTag).toBe(config.startSeed))
			.then(done);
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
			.then(done);
	});
});