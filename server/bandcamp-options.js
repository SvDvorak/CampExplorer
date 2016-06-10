module.exports = {
	createAlbumsOptions: function(tag, page) {
		var options = {
		method: "POST",
		uri: "https://bandcamp.com/api/discover/2/get",
		headers: { "Content-Type": "application/json;charset=UTF-8" },
		json: {
	    	"s": "top",
			"p": page,
			"t": tag
			}
		};

		return options;
	},

	createTagsOptions: function(bandId, albumId) {
		var options = {
		method: "POST",
		uri: "https://bandcamp.com/api/mobile/17/tralbum_tags",
		headers: { "Content-Type": "application/json;charset=UTF-8" },
		json: {
	    	"band_id": bandId,
			"tralbum_type": "a",
			"tralbum_id": albumId
			}
		};

		return options;
	},
}