var bandcampMultiTag = angular.module('multiTagApp', [])
    .config([
    	'$compileProvider',
    	function ($compileProvider) {
        	//  Default imgSrcSanitizationWhitelist: /^\s*((https?|ftp|file|blob):|data:image\/)/
        	$compileProvider.imgSrcSanitizationWhitelist(/^\s*((https?|ftp|file|blob|chrome-extension):|data:image\/)/);
    }
]);

bandcampMultiTag.controller('tagsController', function ($scope) {
    $scope.albums = [];
  	$scope.isSearching = false;
  	$scope.retryTime = 5;

  	$scope.tags = [];
    $scope.uncachedTags = [];

  	$scope.addInputTag = function() {
  	    var newTag = $scope.newTag.replace(" ", "-");
  	    $scope.addTag(newTag);
  	    $scope.newTag = null;
   	};

   	$scope.addTag = function(tag) {
  	    if($scope.tags.indexOf(tag) == -1) {
    	      $scope.tags.push(tag);
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
    		$scope.makeRequest($scope.tags, function(albums) {
            $scope.$apply(() => {
                $scope.uncachedTags = [];
                $scope.albums = albums;
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
                $scope.$apply(() => {
                  $scope.uncachedTags = JSON.parse(xhr.responseText).data;
                });

                setTimeout(() => {
                    $scope.makeRequest(tags, onDone);
                }, $scope.retryTime*1000);
            }
  	    }

  	    xhr.send(JSON.stringify(tags));
  	}
});