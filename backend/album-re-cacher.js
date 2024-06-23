
module.exports = AlbumRecacher = function(database, updater, log) {
	this.database = database;
	this.updater = updater;
	this.log = log;
};

AlbumRecacher.prototype = {
	execute: async function() {
		if(!this.updater.isIdle()) {
			return;
		}

		try {
            var album = await this.database.getAlbumWithoutUpdatedTags();
            if(album != null && !album.hasTagsBeenUpdated) {
                await this.updater.updateAlbum(album);
            }
		}
		catch(e) {
            this.log("Failed recaching because " + e);
		}
	}
};