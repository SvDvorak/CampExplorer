
var albums = []

module.exports = {
    getAlbumsByTag: function (tag) {
    	if(tag in albums)
    	{
	        return [ albums[tag] ];
	    }
	    else
	    {
	    	return [];
	    }
    },

    setAlbumForTag: function (tag, newAlbum) {
        albums[tag] = newAlbum;
    }
};
