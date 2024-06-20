var Promise = require("bluebird");
var DatabaseFake = require("./database-fake");
var CacheUpdater = require("../cache-updater");

describe("Cache updater", function () {
	var bandcamp;
	var database;
	var sut;
	var tagsRequested = [];
	var logCalls = [];

	beforeEach(async function () {
		tagsRequested = [];
		bandcamp = {
			tagAlbums: {},
			getAlbumsForTag: function (tag) {
				tagsRequested.push(tag);
				if(tag in this.tagAlbums)
					return Promise.resolve(this.tagAlbums[tag]);
				return Promise.resolve([]);
			}
		};
		database = new DatabaseFake();
		sut = new CacheUpdater(bandcamp, database, logText => logCalls.push(logText));
		logCalls = [];
	});

	it("does nothing but return when tags are empty", async () => {
		await sut.updateTags([]);
		expect(tagsRequested.length).toBe(0);
	});

	it("saves tags and albums", async () => {
		var expectedTags = ["tag1", "tag2"];
		var expectedAlbums = [
			{ tag: "tag1", albums: [{ id: "123" }] },
			{ tag: "tag2", albums: [{ id: "345" }] }
		];

		bandcamp.tagAlbums[expectedTags[0]] = expectedAlbums[0].albums;
		bandcamp.tagAlbums[expectedTags[1]] = expectedAlbums[1].albums;

		await sut.updateTags(expectedTags);
		expect(database.savedTags).toEqual(expectedTags);
		expect(database.saveAlbumsCalls).toEqual(expectedAlbums);
	});

	it("ignores tags that are already queued", async () => {
		sut.updateTags(["tag"]);
		sut.updateTags(["tag"]);

		expect(tagsRequested.length).toBe(1);
		expect(sut.queueLength()).toBe(1);
	});

	it("removes tag from queue when finished updating", async () => {
		await sut.updateTags(["tag"]);
		expect(sut.queueLength()).toBe(0);
	});

	it("adds to end of queue when adding to populated queue", async () => {
		var tags1 = ["tag1", "tag2"]
		var tags2 = ["tag3", "tag4"]
		var expectedTags = tags1.concat(tags2);

		await sut.updateTags(tags1);
		await sut.updateTags(tags2);

		expect(database.savedTags).toEqual(expectedTags);
	});

	it("logs and skips tag when update fails", async () => {
		bandcamp.getAlbumsForTag = createGetMethodThatFailsFor(bandcamp.getAlbumsForTag, 1)

		await sut.updateTags(["tag1"]);
		expect(tagsRequested).toEqual(["tag1"]);
		expect(logCalls.length).toBe(1);
	});

	var createGetMethodThatFailsFor = function (previousMethod, callCount) {
		var calls = 0;
		return async function(tag) {
			var promise = previousMethod.bind(bandcamp)(tag);
			if (calls < callCount) {
				calls++;
				return new Promise((resolve, reject) => { throw new Error("error") });
			}
			return promise;
		};
	}

	it("is idle when not updating", async () => {
		expect(sut.isIdle()).toBe(true);

		var updatePromise = sut.updateTags(["tag"]);

		expect(sut.isIdle()).toBe(false);

		await updatePromise;
		expect(sut.isIdle()).toBe(true);
	});
});