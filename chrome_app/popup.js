var bandcampMultiTag = angular.module('multiTagApp', [])
    .config([
    	'$compileProvider',
    	function ($compileProvider) {
        	//  Default imgSrcSanitizationWhitelist: /^\s*((https?|ftp|file|blob):|data:image\/)/
        	$compileProvider.imgSrcSanitizationWhitelist(/^\s*((https?|ftp|file|blob|chrome-extension):|data:image\/)/);
    }
]);

function Tag(name) {
    this.name = name;
    this.isCaching = false;
}

bandcampMultiTag.controller('tagsController', function ($scope) {
    $scope.albums = [];
  	$scope.isSearching = false;
    $scope.isCachingTags = false;
  	$scope.retryTime = 5;
  	$scope.tags = [];

    chrome.storage.local.get({ 'lastUsedTags' : [] }, result => {
        $scope.$apply(() => {
            result.lastUsedTags.forEach(x => { $scope.addTag(x); });
        });
    });

  	$scope.addInputTag = function() {
  	    var newTag = $scope.newTag.replace(" ", "-");
  	    $scope.addTag(newTag);
  	    $scope.newTag = null;
   	};

   	$scope.addTag = function(tag) {
  	    if($scope.tags.map(x => x.name).indexOf(tag) == -1) {
    	      $scope.tags.push(new Tag(tag));
    	      $scope.searchTags();
  	    }
  	};

   	$scope.removeTag = function(tag) {
        var i = $scope.tags.indexOf(tag);
        if(i != -1) {
            $scope.tags.splice(i, 1);
        }
        $scope.searchTags();
  	};

  	$scope.searchTags = function() {
        $scope.isSearching = true;
        chrome.storage.local.set({ lastUsedTags: $scope.tags.map(x => x.name) });
    		$scope.makeRequest($scope.tags.map(x => x.name), function(albums) {
            $scope.$apply(() => {
                $scope.albums = albums;
                $scope.isCachingTags = false;
                $scope.tags.forEach(x => x.isCaching = false);
                $scope.isSearching = false;
            });
    		});
  	};

  	$scope.makeRequest = function(tags, onDone) {
    		var xhr = new XMLHttpRequest();
  	    xhr.open("POST", "http://localhost:8079/v1/albums", true);
  	    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  	    xhr.onreadystatechange = () => {
            if(xhr.readyState != 4) {
                return;
            }

  	        if(xhr.status == 200) {
  	        	  onDone(JSON.parse(xhr.responseText));
  	        }
            else if(xhr.status == 202) {
                var uncachedTags = JSON.parse(xhr.responseText).data;
                $scope.$apply(() => {
                  $scope.isCachingTags = true;
                  uncachedTags.forEach(tag => {
                      var matchingIndex = $scope.tags.map(x => x.name).indexOf(tag);
                      if(matchingIndex != -1) {
                          $scope.tags[matchingIndex].isCaching = true;
                      }
                  })
                });

                setTimeout(() => {
                    $scope.makeRequest(tags, onDone);
                }, $scope.retryTime*1000);
            }
  	    }

  	    xhr.send(JSON.stringify(tags));
  	}
});