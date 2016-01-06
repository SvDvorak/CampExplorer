#Bandcamp Tag Search
This repository contains the code for the Bandcamp tag search Chrome extension. On Bandcamp you're only able to search for albums using a single tag but this extension enables you to search for albums with any number of matching tags.

![Bandcamp tag search](http://i.imgur.com/IAnsx3i.png)

Implemented by scraping the search results of multiple Bandcamp tag searches and filters out albums that do not have all tags.

##Usage
Just type in and add the tags you want matching albums for. Click on the album to jump to its page.
If you want to check out multiple found albums I recommend you wait until the search finishes so the extension doesn't have to search again when you reopen it.

##Known Issues
- Speed - It takes a while to search for albums. It'll remain an issue until Bandcamp opens up their API.
- Too many searches - Bandcamp denies requests if too many are sent in a short period, this occurs when user is doing many searches.
- Missing albums - The tag search on Bandcamp is limited to 400 albums per tag so some albums might not be found.

##Release Notes
1.0.2
- Changed Bandcamp throttling message.

1.0.1
- Fixed app not handling 503 (Service unavailable) errors which occurs when searching Bandcamp too often. App now retries multiple times with a longer timeout for each try. A graphical icon next to the search spinner indicates when this is happening.

1.0.0
- Initial release