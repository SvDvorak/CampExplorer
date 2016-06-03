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

	it("returns albums", function(done) {
        var album = new Album(
                "Album name",
                "Artist name",
                "www.imagelink.com",
                "www.albumlink.com");               

        bandcampFake.setAlbumsForTag("tag", album);

        var xhr = new XMLHttpRequest();
        xhr.open("GET", "http://localhost:8079", true);
        xhr.onreadystatechange = function() {
            if(xhr.readyState == 4 && xhr.status == 200) {
                var actualAlbums = JSON.parse(xhr.responseText);
                expect(actualAlbums.name).toBe("Album name");
                expect(actualAlbums.artist).toBe("Artist name");
                expect(actualAlbums.image).toBe("www.imagelink.com");
                expect(actualAlbums.link).toBe("www.albumlink.com");
                done();
            }
        }

        xhr.send();
    });
});
