var server = require("../server/server");
var bandcampFake = require("../server/bandcamp-fake");
var Album = require("../api-types");

var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

describe("Server with cache", function() {
    beforeEach(function(done) {
        server.start(bandcampFake);
        setTimeout(function() {
            done();
        });
    });

    it("returns complete album", function(done) {
        var album = new Album(
            "Album name",
            "Artist name",
            "www.imagelink.com",
            "www.albumlink.com");

        bandcampFake.setAlbumForTag("tag", album);

        requestAlbumsWithTag("tag", function(responseText) {
            var albumsResponse = JSON.parse(responseText);
            expect(albumsResponse.length).toBe(1);
            var actualAlbum = albumsResponse[0];
            expect(actualAlbum.name).toBe("Album name");
            expect(actualAlbum.artist).toBe("Artist name");
            expect(actualAlbum.image).toBe("www.imagelink.com");
            expect(actualAlbum.link).toBe("www.albumlink.com");
            done();
        });
    });

    var requestAlbumsWithTag = function(tag, onResponse) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "http://localhost:8079/v1/tags/" + tag, true);
        xhr.onreadystatechange = function() {
            if(xhr.readyState == 4 && xhr.status == 200) {
                onResponse(xhr.responseText);
            }
        }

        xhr.send();
    }
});
