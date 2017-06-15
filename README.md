<p align="center">
  <img src="http://campexplorer.io/campexplorer.svg" alt="Logo" width="250" />
</p>

# Camp Explorer
This repository contains the code for the Camp Explorer website and Chrome extension. On Bandcamp you're only able to search for albums using a single tag but this extension enables you to search for albums with any number of matching tags.

<p align="center">
  <img src="http://i.imgur.com/IAnsx3i.png" alt="Screenshot" />
</p>

## Usage
Type in a search criteria and press add. Repeat for all criterias you want to find albums for. Click the x to the right of the added search criteria to remove it.

When you find an interesting album, click on it to jump to its page.

Note that search criterias that have not been cached previously might take a while for the server to cache up.

## Implementation
The app is made up of two clients (web and Chrome app) and one Node.js server. Docker is used for running and managing the server.

When user requests a tag the server searches either returns the cached results or if they don't exist it puts the request in queue to be searched and cached. Cache is saved to an ElasticSearch database that also handles the filtering on request.

The server continously recaches tags in order of oldest first with a minute delay until it starts next tag. It's possible to start the server with an initial seed-tag. It then caches up all albums for the seed and then caches all the tags that each of those albums had. Note that this will take a few hours.

Statistics of the server is also hosted to see the state of caching, just add /statistics to see it.

## Known Issues
- It isn't possible to get all albums from Bandcamp so some albums might be missing.

## Release Notes
2.0.0
- New web-client
- Added updrade message to app
- Major changes to how searching works compared to older version of Chrome app, should give a 10x increase in results and return them much faster if they've already been cached.

1.0.3
- Fixed rare error when having multiple tags

1.0.2
- Changed Bandcamp throttling message.

1.0.1
- Fixed app not handling 503 (Service unavailable) errors which occurs when searching Bandcamp too often. App now retries multiple times with a longer timeout for each try. A graphical icon next to the search spinner indicates when this is happening.

1.0.0
- Initial release
