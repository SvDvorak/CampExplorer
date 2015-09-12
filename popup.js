var tags = [];

function searchForAlbumsWithTags() {
  //var tag1 = document.getElementById('tag1').value;
  //var tag2 = document.getElementById('tag2').value;
  var tag1 = "ambient";
  var tag2 = "electronic";

  var htmlToDiv = html => { var q = document.createElement('div'); q.innerHTML = html; return q;};
  var intersect = (a,b) => a.filter(q => !!b.find(f => f.link == q.link));
  var intersectAndUpdateUI = (a, b) => updateUIFromList(intersect(a, b));
  var htmlToLinks = ii => parseDiv(htmlToDiv(ii));

  var items1 = [];
  var items2 = [];
  for (var page = 1; page < 2; page++){
    getTagPage(tag1, page, f => { items1 = items1.concat(htmlToLinks(f)); intersectAndUpdateUI(items1, items2) });
    getTagPage(tag2, page, f => { items2 = items2.concat(htmlToLinks(f)); intersectAndUpdateUI(items1, items2) });
  }
}

function getTagPage(tag, page, onDone){
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://bandcamp.com/tag/' + tag + '?page=' + page, true);
  console.log("request for " + tag + " on page " + page)
  xhr.onreadystatechange = () => xhr.readyState == 4 && xhr.status == 200 && onDone(xhr.responseText);
  xhr.send();
}

function parseDiv(div) {
  return [].slice.call(div.querySelectorAll('.item_list > .item')).map(parseAlbumInfo);
}

function parseAlbumInfo(albumHtml) {
  var imageRegEx = /return 'url\((.+)\)'/;
  var image = imageRegEx.exec(albumHtml.innerHTML)[1];

  return {
    name: albumHtml.children[0].children[1].innerText,
    artist: albumHtml.children[0].children[2].innerText,
    image: image[1], link: albumHtml.children[0].href,
    html: albumHtml.outerHTML };
}

function updateUIFromList(list) {
  document.getElementById('albums').innerHTML = list.map(f => f.html).join('');
}

document.addEventListener('DOMContentLoaded', function() {
  searchForAlbumsWithTags();
  
  document.getElementById('add').addEventListener('click', () =>
  {
    var newTagName = document.getElementById('newTag').value;
    tags.push(newTagName);
    var tagElement = document.createElement('div');
    tagElement.innerText = newTagName + " ";

    var removeTag = document.createElement('a');
    removeTag.innerText = "x ";
    removeTag.addEventListener('click', () => tagElement.removeChild(tagElement));

    tagElement.appendChild(removeTag);
    document.getElementById('tags').appendChild(tagElement);
  });
  //document.getElementById('search').addEventListener('click', searchForAlbumsWithTags);
});
