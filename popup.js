var bandcampMultiTag = angular.module('multiTagApp', [])
.config([
  '$compileProvider',
  function ($compileProvider) {
      //  Default imgSrcSanitizationWhitelist: /^\s*((https?|ftp|file|blob):|data:image\/)/
      $compileProvider.imgSrcSanitizationWhitelist(/^\s*((https?|ftp|file|blob|chrome-extension):|data:image\/)/);
  }
]);

bandcampMultiTag.controller('tagsController', function ($scope) {
  $scope.tags = ["ambient", "electronica"];
  $scope.albums = [];

  var MaxPages = 1;

  $scope.addTag = function() {
    if($scope.tags.indexOf($scope.newTag) == -1) {
      $scope.tags.push($scope.newTag);
    }
    $scope.newTag = "";
  }

  $scope.removeTag = function(tag) {
    $scope.tags.splice($scope.tags.indexOf(tag), 1);
  }

  $scope.search = function(tag) {
    $scope.searchesInProgress = $scope.tags.length * MaxPages;
    $scope.albums = [];

    tagAlbums = $scope.tags.map(x => { return { tag: x, albums: [] } });
    var items1 = [];
    var items2 = [];
    for (var tagNumber = 0; tagNumber < $scope.tags.length; tagNumber++) {
      var tag = $scope.tags[tagNumber];
      for (var page = 1; page <= MaxPages; page++){
        $scope.getTagPageAsync(tag, tagNumber, page, (responseText, tagNumber) => $scope.updateAlbums($scope.htmlToAlbums(responseText), tagNumber));
      }
    }
  }

  $scope.htmlToAlbums = function(html) {
    var q = document.createElement('div');
    q.innerHTML = html;
    return $scope.parseAlbum(q);
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

  $scope.getTagPageAsync = function(tag, tagNumber, page, onDone) {
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

    var album = {
      name: albumHtml.children[0].children[1].innerText,
      artist: albumHtml.children[0].children[2].innerText,
      image: image,
      link: albumHtml.children[0].href
    };

    $scope.loadImageAsync(image, localUrl => $scope.$apply(() => album.image = localUrl));

    return album;
  }

  $scope.loadImageAsync = function(url, onDone) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'blob';
    xhr.onload = function(e) {
      onDone(window.URL.createObjectURL(this.response));
    };

    xhr.send();
  }

  $scope.getAlbumsWithAllTags = function(tagAlbums) {
    return intersect(tagAlbums[0], tagAlbums[1]);
  }
});