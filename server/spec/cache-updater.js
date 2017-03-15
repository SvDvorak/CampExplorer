var BandcampFake = require("./bandcamp-fake");
var DatabaseFake = require("./database-fake");
var CacheUpdater = require("../source/cache-updater");

describe("Cache updater", function() {
	var bandcamp;
	var database;
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
		database = new DatabaseFake();
		cache = { albums: {} };
		sut = new CacheUpdater(cache, bandcamp, database, function(text) { });
    });

	var createSaveData = function(saveAddress, saveData) {
		return { address: saveAddress, data: saveData };
	};

	it("does nothing but call callback when tags are empty", function() {
		var callbackCalled = false;
		sut.updateTags([], function() { callbackCalled = true; });

		expect(callbackCalled).toBe(true);
		expect(tagsRequested.length).toBe(0);
	});

	it("saves tags and albums", function() {
		var expectedTags = [ "tag1", "tag2" ]
		sut.updateTags(expectedTags);

		var expectedAlbums = [ { id: "123" }, { id: "345" } ];

		dataReturnedCallback(expectedAlbums[0]);
		dataReturnedCallback(expectedAlbums[1]);

		expect(database.savedTags).toEqual(expectedTags);
		expect(database.savedAlbums).toEqual(expectedAlbums);
	});

	it("ignores tags that are already queued", function() {
		sut.updateTags(["tag"]);
		sut.updateTags(["tag"]);

		expect(tagsRequested.length).toBe(1);
		expect(sut.queueLength()).toBe(1);
	});

	it("removes tag from queue when finished updating", function() {
		sut.updateTags(["tag"]);

		dataReturnedCallback();

		expect(sut.queueLength()).toBe(0);
	});

	it("adds to end of queue when adding to populated queue", function() {
		var tags1 = [ "tag1", "tag2" ]
		var tags2 = [ "tag3", "tag4" ]
		var expectedTags = tags1.concat(tags2);

		sut.updateTags(tags1);
		sut.updateTags(tags2);

		dataReturnedCallback();
		expect(database.savedTags).toEqual(expectedTags.slice(0, 1));
		dataReturnedCallback();
		expect(database.savedTags).toEqual(expectedTags.slice(0, 2));
		dataReturnedCallback();
		expect(database.savedTags).toEqual(expectedTags.slice(0, 3));
		dataReturnedCallback();
		expect(database.savedTags).toEqual(expectedTags.slice(0, 4));
	});

	it("calls tag albums updated event", function() {
		var tags = [ "tag1", "tag2" ]
		var callbackCount = 0;
		sut.updateTags(tags, albums => { callbackCount += 1; });
		dataReturnedCallback([ "Album1" ]);
		dataReturnedCallback([ "Album2" ]);

		expect(callbackCount).toBe(1);
	});

	it("retries updating when request fails", function() {
		sut.updateTags([ "tag1" ]);

		errorCallback();

		expect(tagsRequested).toEqual([ "tag1", "tag1" ]);
	});

	it("is idle when queue is empty", function() {
		expect(sut.isIdle()).toBe(true);

		sut.updateTags(["tag"]);

		expect(sut.isIdle()).toBe(false);
	});
});