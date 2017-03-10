var bandcampMultiTag = angular.module('adminApp', []);

function Tag(name) {
    this.name = name;
    this.isCaching = false;
}

bandcampMultiTag.controller('adminController', [ "$scope", "$http", function ($scope, $http) {
    $scope.adress = "localhost";
    $scope.port = 3000;

    var CreateAdminOptions = endpoint => { };

    var cachedTagsFunc = function() {
        var tile = this;
        $http({
            method: "get",
            url: "http://" + $scope.adress + ":" + $scope.port + "/admin/tagcount"
        })
        .then(response => {
            tile.body = response.data;
        });
    }

    var tagsInQueue = function() {
        var tile = this;
        $http({
            method: "get",
            url: "http://" + $scope.adress + ":" + $scope.port + "/admin/tagsinqueue"
        })
        .then(response => {
            tile.body = response.data;
        });
    }

    $scope.tiles = [
        { header: "Cached tags", body: 0, update: cachedTagsFunc },
        { header: "Tags in queue", body: 1, update: tagsInQueue },
        { header: "Currently caching", body: "ambient", update: () => {} },
        { header: "Requests per second", body: "3.14", update: () => {} }];
    
    $scope.tiles.forEach(tile => setInterval(() => tile.update(), 1000));
    //setInterval(() => $scope.tiles[0].update(), 1000);

  	$scope.addInputTag = function() {
  	    var newTag = $scope.newTag.replace(" ", "-");
  	    $scope.addTag(newTag);
  	    $scope.newTag = null;
        $scope.updateUserSearchCount();
   	};
}]);