var bandcampMultiTag = angular.module('adminApp', []);

function Tag(name) {
    this.name = name;
    this.isCaching = false;
}

bandcampMultiTag.controller('adminController', [ "$scope", "$http", function ($scope, $http) {
    $scope.adress = "localhost";
    $scope.port = 3000;

    var CreateAdminOptions = endpoint => { };

    var callAdminService = function(tile, endpoint) {
        return $http({
            method: "get",
            url: "http://" + $scope.adress + ":" + $scope.port + "/admin/" + endpoint
        })
        .then(response => {
            return response.data != "" ? JSON.parse(response.data) : "";
        })
        .then(data => tile.body = data);
    };

    var cachedTagsFunc = function() {
        callAdminService(this, "tagcount");
    }

    var tagsInQueue = function() {
        callAdminService(this, "tagsinqueue");
    }

    var currentlyCaching = function() {
        callAdminService(this, "currentlycachingtag");
    }

    $scope.tiles = [
        { header: "Server status", body: "Online and ready =D", update: () => {} },
        { header: "Cached tags", body: 0, update: cachedTagsFunc },
        { header: "Tags in queue", body: 0, update: tagsInQueue },
        { header: "Currently caching", body: "", update: currentlyCaching },
        { header: "Requests per second", body: "3.14", update: () => {} }];
    
    $scope.tiles.forEach(tile => tile.update());
    $scope.tiles.forEach(tile => setInterval(() => tile.update(), 1000));

  	$scope.addInputTag = function() {
  	    var newTag = $scope.newTag.replace(" ", "-");
  	    $scope.addTag(newTag);
  	    $scope.newTag = null;
        $scope.updateUserSearchCount();
   	};
}]);