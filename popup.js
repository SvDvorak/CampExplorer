var bandcampMultiTag = angular.module('multiTagApp', [])
.config([
  '$compileProvider',
  function ($compileProvider) {
      //  Default imgSrcSanitizationWhitelist: /^\s*((https?|ftp|file|blob):|data:image\/)/
      $compileProvider.imgSrcSanitizationWhitelist(/^\s*((https?|ftp|file|blob|chrome-extension):|data:image\/)/);
  }
]);

bandcampMultiTag.controller('tagsController', function ($scope) {
  $scope.loadingController = true;

  var MaxPages = 1;

  $scope.albums = [];
  $scope.tagAlbums = [];
  $scope.searchesInProgress = 0;

  chrome.storage.local.get({ 'tagAlbums' : [] }, result => {
    $scope.$apply(() => {
      $scope.tagAlbums = result.tagAlbums;
      $scope.albums = $scope.getAlbumsWithAllTags();
    });
  });

  $scope.addTag = function() {
    if($scope.tagAlbums.map(x => x.tag).indexOf($scope.newTag) == -1) {
      var newTagAlbum = { tag: $scope.newTag, albums: [] };
      $scope.tagAlbums.push(newTagAlbum);
      $scope.searchTag(newTagAlbum);
    }
    $scope.newTag = null;
  }

  $scope.removeTag = function(tagAlbum) {
    $scope.tagAlbums.splice($scope.tagAlbums.indexOf(tagAlbum), 1);
    $scope.updateAlbumsWithAllTags();
  }

  $scope.updateAlbumsWithAllTags = function() {
    $scope.albums = $scope.getAlbumsWithAllTags();

    chrome.storage.local.set({ tagAlbums: $scope.tagAlbums });
  }

  $scope.getAlbumsWithAllTags = function() {
    if($scope.tagAlbums.length > 0) {
      return $scope.intersectRecursive($scope.tagAlbums[0].albums, 1);
    }

    return [];
  }

  $scope.searchTag = function(tagAlbum) {
    $scope.albums = [];
    $scope.searchesInProgress += MaxPages;

    for (var page = 1; page <= MaxPages; page++){
      $scope.getTagPageAsync(tagAlbum.tag, page, responseText => {
        tagAlbum.albums = tagAlbum.albums.concat($scope.htmlToAlbums(responseText));
        $scope.$apply(() => {
          $scope.searchesInProgress -= 1;
          $scope.updateAlbumsWithAllTags();
        });
      })
    }

    $scope.loadingController = false;
  }

  $scope.htmlToAlbums = function(html) {
    var q = document.createElement('div');
    q.innerHTML = html;
    return $scope.parseAlbums(q);
  }

  $scope.intersect = function(a, b) {
    return a.filter(q => !!b.find(f => f.link == q.link));
  }

  $scope.intersectRecursive = function(currentAlbums, index) {
    if(index == $scope.tagAlbums.length) {
      return currentAlbums;
    }

    return $scope.intersectRecursive($scope.intersect(currentAlbums, $scope.tagAlbums[index].albums), index+1);
  }

  $scope.getTagPageAsync = function(tag, page, onDone) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://bandcamp.com/tag/' + tag + '?page=' + page, true);
    console.log("request for " + tag + " on page " + page)
    xhr.onreadystatechange = () => xhr.readyState == 4 && xhr.status == 200 && onDone(xhr.responseText);
    xhr.send();
  }

  $scope.parseAlbums = function(div) {
    return [].slice.call(div.querySelectorAll('.item_list > .item')).map($scope.parseAlbum);
  }

  $scope.parseAlbum = function(albumHtml) {
    var imageRegEx = /return 'url\((.+)\)'/;
    var image = imageRegEx.exec(albumHtml.innerHTML)[1];

    return {
      name: albumHtml.children[0].children[1].innerText,
      artist: albumHtml.children[0].children[2].innerText,
      image: image,
      link: albumHtml.children[0].href
    };
  }
});