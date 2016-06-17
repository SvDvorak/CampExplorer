var BandcampFake = require("./bandcamp-fake");
var CacheUpdater = require("../server/cache-updater");

describe("Cache updater", function() {
	var bandcamp;
	var cache;
	var sut;
	var dataReturnedCallback;
	var errorCallback;
	var tagsRequested = [];

	beforeEach(function() {
		tagsRequested = [];
		bandcamp = {
			getAlbumsForTag: function(tag, success, error) {
				tagsRequested.push(tag);
				dataReturnedCallback = success;
				errorCallback = error;
		}};
    	cache = { albums: {} };
		sut = new CacheUpdater(cache, bandcamp, function(text) { });
    });

	it("does nothing when tags are empty", function() {
		sut.updateTags([]);

		expect(tagsRequested.length).toBe(0);
	});

	it("ignores tags that are already queued", function() {
		sut.updateTags(["tag"]);
		sut.updateTags(["tag"]);

		expect(tagsRequested.length).toBe(1);
	});

	it("removes tag from queue when finished updating", function() {
		sut.updateTags(["tag"]);
		sut.updateTags([]);
		sut.updateTags([]);

		expect(tagsRequested.length).toBe(1);
	});

	it("rewrites queue when adding to empty queue", function() {
		var tags = [ "tag1", "tag2" ]
		sut.updateTags(tags);

		dataReturnedCallback();

		expect(tagsRequested).toEqual(tags);
	});

	it("adds to queue when adding to populated queue", function() {
		var tags1 = [ "tag1", "tag2" ]
		sut.updateTags(tags1);

		var tags2 = [ "tag3", "tag4" ]
		sut.updateTags(tags2);

		dataReturnedCallback();
		dataReturnedCallback();
		dataReturnedCallback();

		expect(tagsRequested).toEqual(tags1.concat(tags2));
	});

	it("calls tag albums updated event", function() {
		var tags = [ "tag" ]
		var callbackCalled = false;
		sut.updateTags(tags, function(albums) { callbackCalled = true; });
		dataReturnedCallback([ "Album" ]);

		expect(callbackCalled).toBe(true);
	});

	it("retries updating when request fails", function() {
		sut.updateTags([ "tag1" ]);

		errorCallback();

		expect(tagsRequested).toEqual([ "tag1", "tag1" ]);
	});

	it("updates only uncached", function() {
		cache.filterUncached = function(tags) {
			expect(tags).toEqual(["tag1", "tag2"])
			return ["tag2"];
		};

		sut.updateUncachedTags(["tag1", "tag2"]);

		expect(tagsRequested).toEqual(["tag2"]);
	});
});