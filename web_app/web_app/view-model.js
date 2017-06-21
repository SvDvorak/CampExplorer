var tagsearch = angular.module('tagsearch', ['tw.directives.clickOutside'])
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

tagsearch.controller('searchController', function ($scope) {
    $scope.adress = "localhost";
    $scope.port = 3000;

    $scope.albums = [];
    $scope.isSearching = false;
    $scope.isCachingTags = false;
    $scope.retryTime = 5;
    $scope.tags = [];
    $scope.latestRequestId = 0;

    $scope.showVersionChangesQuestion = false;

    $scope.userSearchCount = 0;
    $scope.canShowReviewSuggestion = true;
    $scope.showReviewSuggestionNow = false;
    $scope.reviewSuggestionSearchCount = 50;

  	$scope.addInputTag = function() {
        if($scope.tags.length >= 10) {
            return;
        }

  	    var newTag = $scope.newTag.replace(/[, ]/g, "-");
  	    $scope.addTag(newTag);
  	    $scope.newTag = null;
        $scope.updateUserSearchCount();
   	};

   	$scope.addTag = function(tag) {
  	    if($scope.tags.map(x => x.name).indexOf(tag) == -1) {
    	      $scope.tags.push(new Tag(tag));
    	      $scope.searchTags();
  	    }
  	};

    $scope.updateUserSearchCount = function() {
        $scope.userSearchCount += 1;

        if($scope.canShowReviewSuggestion &&
          $scope.userSearchCount % $scope.reviewSuggestionSearchCount == 0)
        {
            $scope.showReviewSuggestionNow = true;
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
        $scope.latestRequestId += 1;
        var requestId = $scope.latestRequestId;

        $scope.isSearching = true;
		$scope.makeRequest($scope.tags.map(x => x.name), requestId, function(albums) {
            $scope.$apply(() => {
                $scope.albums = albums;
                $scope.isCachingTags = false;
                $scope.tags.forEach(x => x.isCaching = false);
                $scope.isSearching = false;
            });
		});
  	};

  	$scope.makeRequest = function(tags, requestId, onDone) {
        var retryCall = () => {
            setTimeout(() => {
                $scope.makeRequest(tags, requestId, onDone);
            }, $scope.retryTime*1000);
        };

        var xhr = new XMLHttpRequest();
        xhr.open("POST", "http://" + $scope.adress + ":" + $scope.port + "/v1/albums", true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.onreadystatechange = () => {
            $scope.$apply(() => { $scope.serverUnreachable = false });

            if(xhr.readyState != 4 || requestId != $scope.latestRequestId) {
                return;
            }

            if(xhr.status == 200) {
                onDone(JSON.parse(xhr.responseText));
            }
            else if(xhr.status == 202) {
                var uncachedTags = JSON.parse(xhr.responseText).data;
                $scope.$apply(() => {
                  $scope.albums = [];
                  $scope.markUncachedTags(uncachedTags);
                });

                retryCall();
            }
        }
        xhr.onerror = () => {
            $scope.$apply(() => { $scope.serverUnreachable = true });
            retryCall();
        }

        xhr.send(JSON.stringify(tags));
  	};

    $scope.markUncachedTags = function(uncachedTags) {
        $scope.isCachingTags = true;
        $scope.tags.forEach(tag => { tag.isCaching = false });
        
        uncachedTags.forEach(tag => {
            var matchingIndex = $scope.tags.map(x => x.name).indexOf(tag);
            if(matchingIndex != -1) {
                $scope.tags[matchingIndex].isCaching = true;
            }
        })
    };
});
