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
  	$scope.searchesInProgress = 0;
  	$scope.retryCount = 0;

  	$scope.tags = [];

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
    		$scope.makeRequest($scope.tags, function(albums) {
            console.log(albums);
            $scope.$apply(() => {
            $scope.albums = albums;
                $scope.albums = albums;
            });
    		});
  	};

  	$scope.makeRequest = function(tags, onDone) {
  		var xhr = new XMLHttpRequest();
  	    xhr.open("POST", "http://localhost:8079/v1/albums", true);
  	    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  	    xhr.onreadystatechange = () => {
  	        if(xhr.readyState == 4 && xhr.status == 200) {
  	        	onDone(JSON.parse(xhr.responseText));
  	        }
  	    }

  	    xhr.send(JSON.stringify(tags));
  	}
});