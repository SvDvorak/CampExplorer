var BandcampFake = require("../server/bandcamp-fake");
var CacheUpdater = require("../server/cache-updater");

describe("Cache updater", function() {
	var bandcamp;
	var cache;
	var sut;
	var dataReturnedCallback;
	var tagsRequested = [];

	beforeEach(function() {
		tagsRequested = [];
		bandcamp = {
			getAlbumsForTag: function(tag, callback) {
				tagsRequested.push(tag);
				dataReturnedCallback = callback;
		}};
    	cache = { albums: {} };
		sut = new CacheUpdater(cache, bandcamp, function(text) { });
    });

	it("does nothing when queue is empty", function() {
		sut.runUpdate();

		expect(tagsRequested.length).toBe(0);
	});

	it("ignores run calls when update already in progress", function() {
		sut.queueTags(["tag"]);
		sut.runUpdate();
		sut.runUpdate();

		expect(tagsRequested.length).toBe(1);
	});

	it("removes tag from queue when finished updating", function() {
		sut.queueTags(["tag"]);

		sut.runUpdate();
		sut.runUpdate();
		sut.runUpdate();

		expect(tagsRequested.length).toBe(1);
	});

	it("rewrites queue when adding to empty queue", function() {
		var tags = [ "tag1", "tag2" ]
		sut.queueTags(tags);

		sut.runUpdate();
		dataReturnedCallback();

		expect(tagsRequested).toEqual(tags);
	});

	it("adds to queue when adding to populated queue", function() {
		var tags1 = [ "tag1", "tag2" ]
		sut.queueTags(tags1);

		var tags2 = [ "tag3", "tag4" ]
		sut.queueTags(tags2);

		sut.runUpdate();
		dataReturnedCallback();
		dataReturnedCallback();
		dataReturnedCallback();

		expect(tagsRequested).toEqual(tags1.concat(tags2));
	});
});