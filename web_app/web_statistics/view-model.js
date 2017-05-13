var bandcampMultiTag = angular.module('adminApp', []);

function Tag(name) {
    this.name = name;
    this.isCaching = false;
}

bandcampMultiTag.controller('adminController', [ "$scope", "$http", function ($scope, $http) {
    $scope.adress = "localhost";
    $scope.port = 3000;
    $scope.serverIsUp = false;

    var CreateAdminOptions = endpoint => { };

    var callAdminService = function(tile, endpoint) {
        return $http({
            method: "get",
            url: "http://" + $scope.adress + ":" + $scope.port + "/admin/" + endpoint
        })
        .then(response => {
            return response.data != "" ? JSON.parse(response.data) : "";
        })
        .then(data => tile.body = data)
        .then(() => $scope.serverIsUp = true)
        .catch(() => $scope.serverIsUp = false);
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

    var numberOfAlbums = function() {
        callAdminService(this, "albumcount");
    }

    var requestRate = function() {
        callAdminService(this, "requestrate");
    }

    var serverStatus = function() { this.body = $scope.serverIsUp ? "Online and ready =D" : "Server is down =(" };

    $scope.tiles = [
        { header: "Server status", body: "Online and ready =D", update: serverStatus },
        { header: "Cached tags", body: 0, update: cachedTagsFunc },
        { header: "Tags in queue", body: 0, update: tagsInQueue },
        { header: "Currently caching", body: "", update: currentlyCaching },
        { header: "Number of albums", body: "", update: numberOfAlbums },
        { header: "Requests last 5 min", body: "", update: requestRate }];
    
    $scope.tiles.forEach(tile => tile.update());
    $scope.tiles.forEach(tile => setInterval(() => tile.update(), 1000));

  	$scope.addInputTag = function() {
  	    var newTag = $scope.newTag.replace(" ", "-");
  	    $scope.addTag(newTag);
  	    $scope.newTag = null;
        $scope.updateUserSearchCount();
   	};
}]);
