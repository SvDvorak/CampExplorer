var Promise = require("bluebird");
var BandcampFake = require("./bandcamp-fake");
var DatabaseFake = require("./database-fake");
var CacheUpdater = require("../cache-updater");
require("./test-finished");

describe("Cache updater", function() {
	var bandcamp;
	var database;
	var sut;
	var tagsRequested = [];
	var logCalls = [];

	beforeEach(function() {
		tagsRequested = [];
		bandcamp = {
			tagAlbums: { },
			getAlbumsForTag: function(tag) {
				tagsRequested.push(tag);
				return Promise.resolve(this.tagAlbums[tag]);
		}};
		database = new DatabaseFake();
		sut = new CacheUpdater(bandcamp, database, logText => logCalls.push(logText));
    });

	var createSaveData = function(saveAddress, saveData) {
		return { address: saveAddress, data: saveData };
	};

	it("does nothing but return when tags are empty", function(done) {
		var callbackCalled = false;
		sut.updateTags([])
			.then(() => expect(tagsRequested.length).toBe(0))
			.testFinished(done);
	});

	it("saves tags and albums", function(done) {
		var expectedTags = [ "tag1", "tag2" ];
		var expectedAlbums = [
			{ tag: "tag1", albums: [ { id: "123" } ] },
			{ tag: "tag2", albums: [ { id: "345" } ] }
		];

		bandcamp.tagAlbums[expectedTags[0]] = expectedAlbums[0].albums;
		bandcamp.tagAlbums[expectedTags[1]] = expectedAlbums[1].albums;

		sut.updateTags(expectedTags)
			.then(() => {
				expect(database.savedTags).toEqual(expectedTags);
				expect(database.saveAlbumsCalls).toEqual(expectedAlbums);
			})
			.testFinished(done);
	});

	it("ignores tags that are already queued", function() {
		sut.updateTags(["tag"]);
		sut.updateTags(["tag"]);

		expect(tagsRequested.length).toBe(1);
		expect(sut.queueLength()).toBe(1);
	});

	it("removes tag from queue when finished updating", function(done) {
		sut.updateTags(["tag"])
			.then(() => expect(sut.queueLength()).toBe(0))
			.testFinished(done);
	});

	it("adds to end of queue when adding to populated queue", function(done) {
		var tags1 = [ "tag1", "tag2" ]
		var tags2 = [ "tag3", "tag4" ]
		var expectedTags = tags1.concat(tags2);

		sut.updateTags(tags1);

		sut.updateTags(tags2)
			.then(() => expect(database.savedTags).toEqual(expectedTags))
			.testFinished(done);
	});

	it("logs and skips tag when update fails", function(done) {
		bandcamp.getAlbumsForTag = createGetMethodThatFailsFor(bandcamp.getAlbumsForTag, 1)

		sut.updateTags([ "tag1" ])
			.then(() => {
				expect(tagsRequested).toEqual([ "tag1" ]);
				expect(logCalls.length).toBe(1);
			})
			.testFinished(done);
	});

	var createGetMethodThatFailsFor = function(previousMethod, callCount) {
		var calls = 0;
		return tag => {
			var promise = previousMethod.bind(bandcamp)(tag);
			if(calls < callCount) {
				calls++;
				return new Promise((resolve, reject) => { throw new Error("error") });
			}
			return promise;
		};
	}

	it("is idle when not updating", function(done) {
		expect(sut.isIdle()).toBe(true);

		var updatePromise = sut.updateTags(["tag"]);

		expect(sut.isIdle()).toBe(false);

		updatePromise
			.then(() => expect(sut.isIdle()).toBe(true))
			.testFinished(done);
	});
});