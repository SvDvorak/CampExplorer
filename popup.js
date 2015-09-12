var bandcampMultiTag = angular.module('multiTagApp', []);

bandcampMultiTag.controller('tagsController', function ($scope) {
  $scope.tags = [];
  $scope.albums = [];

  var MaxPages = 2;

  $scope.addTag = function(tag) {
    $scope.tags.push(tag);
  }

  $scope.removeTag = function(tag) {
    $scope.tags.splice($scope.tags.indexOf(tag), 1);
  }

  $scope.search = function() {
    $scope.searchesInProgress = $scope.tags.length * (MaxPages - 1);
    $scope.albums = [];

    var htmlToDiv = html => { var q = document.createElement('div'); q.innerHTML = html; return q;};
    var htmlToAlbums = ii => $scope.parseAlbum(htmlToDiv(ii));

    tagAlbums = $scope.tags.map(x => { return { tag: x, albums: [] } });
    var items1 = [];
    var items2 = [];
    for (var tagNumber = 0; tagNumber < $scope.tags.length; tagNumber++) {
      var tag = $scope.tags[tagNumber];
      for (var page = 1; page < MaxPages; page++){
        $scope.getTagPage(tag, tagNumber, page, (responseText, tagNumber) => $scope.updateAlbums(htmlToAlbums(responseText), tagNumber));
      }
    }
  }

  $scope.updateAlbums = function(albums, tagNumber) {
    tagAlbums[tagNumber].albums = tagAlbums[tagNumber].albums.concat(albums);
    $scope.$apply(() => {
      $scope.albums = $scope.intersectRecursive(tagAlbums[0].albums, 1);
      $scope.searchesInProgress -= 1;
    });
  }

  $scope.intersect = function(a, b) {
    return a.filter(q => !!b.find(f => f.link == q.link));
  }

  $scope.intersectRecursive = function(currentAlbums, index) {
    if(index == tagAlbums.length) {
      return currentAlbums;
    }

    return $scope.intersectRecursive($scope.intersect(currentAlbums, tagAlbums[index].albums), index+1);
  }

  $scope.getTagPage = function(tag, tagNumber, page, onDone) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://bandcamp.com/tag/' + tag + '?page=' + page, true);
    console.log("request for " + tag + " on page " + page)
    xhr.onreadystatechange = () => xhr.readyState == 4 && xhr.status == 200 && onDone(xhr.responseText, tagNumber);
    xhr.send();
  }

  $scope.parseAlbum = function(div) {
    return [].slice.call(div.querySelectorAll('.item_list > .item')).map($scope.parseAlbumInfo);
  }

  $scope.parseAlbumInfo = function(albumHtml) {
    var imageRegEx = /return 'url\((.+)\)'/;
    var image = imageRegEx.exec(albumHtml.innerHTML)[1];

    return {
      name: albumHtml.children[0].children[1].innerText,
      artist: albumHtml.children[0].children[2].innerText,
      image: image[1],
      link: albumHtml.children[0].href
    };
  }

  $scope.getAlbumsWithAllTags = function(tagAlbums) {
    return intersect(tagAlbums[0], tagAlbums[1]);
  }
});

document.addEventListener('DOMContentLoaded', function() {
  //searchForAlbumsWithTags();
  
  /*document.getElementById('add').addEventListener('click', () =>
  {
    var newTagName = document.getElementById('newTag').value;
    tags.push(newTagName);
    var tagElement = document.createElement('div');
    tagElement.innerText = newTagName + " ";

    var removeTag = document.createElement('a');
    removeTag.innerText = "x ";
    removeTag.addEventListener('click', () => tagElement.removeChild(tagElement));

    tagElement.appendChild(removeTag);
    //document.getElementById('tags').appendChild(tagElement);
  });*/
  //document.getElementById('search').addEventListener('click', searchForAlbumsWithTags);
});
