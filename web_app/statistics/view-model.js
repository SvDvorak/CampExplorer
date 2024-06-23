var statistics = angular.module('statistics', []);

function Tag(name) {
    this.name = name;
    this.isCaching = false;
}

statistics.controller('statisticsController', [ "$scope", "$http", function ($scope, $http) {
    $scope.adress = "localhost";
    $scope.serverIsUp = undefined;

    var callAdminService = function(tile, request) {
        return $http(request)
        .then(response => response.data != "" ? JSON.parse(response.data) : "")
        .then(data => tile.body = data)
        .then(() => $scope.serverIsUp = true)
        .catch(() => $scope.serverIsUp = false);
    };

    var adminServiceGet = function(tile, endpoint) {
        return callAdminService(tile, {
            method: "get",
            url: "//" + $scope.adress + "/admin/" + endpoint,
        });
    };

    var adminServicePost = function(tile, endpoint, data) {
        var json = JSON.stringify(data);
        return callAdminService(tile, {
            method: "post",
            url: "//" + $scope.adress + "/admin/" + endpoint,
            data: json,
            headers: {'Content-Type': 'application/json'}
        });
    };

    var cachedTagsFunc = function() {
        adminServiceGet(this, "tagcount");
    }

    var operationsInQueue = function() {
        adminServiceGet(this, "operationsinqueue");
    }

    var currentlyCaching = function() {
        adminServiceGet(this, "currentlycaching");
    }

    var numberOfAlbums = function() {
        adminServiceGet(this, "albumcount");
    }

    var albumsWithoutUpdatedTags = function() {
        adminServiceGet(this, "albumsWithoutUpdatedTags");
    }

    var requestRateLastHour = function() {
        adminServicePost(this, "requestrate", { sinceInHours: 1 });
    }

    var requestRateLastDay = function() {
        adminServicePost(this, "requestrate", { sinceInHours: 24 });
    }

    var serverStatus = function() {
        if($scope.serverIsUp == undefined)
            this.body = "Waiting for response";
        else if($scope.serverIsUp)
            this.body = "Online and ready =D";
        else
            this.body = "Server is down =(" };

    $scope.tiles = [
        { header: "Server status", body: "Online and ready =D", update: serverStatus },
        { header: "Cached tags", body: 0, update: cachedTagsFunc },
        { header: "Operations in queue", body: 0, update: operationsInQueue },
        { header: "Currently caching", body: "", update: currentlyCaching },
        { header: "Number of albums", body: "", update: numberOfAlbums },
        { header: "Not updated albums", body: "", update: albumsWithoutUpdatedTags },
        { header: "Requests last hour", body: "", update: requestRateLastHour },
        { header: "Requests last 24 hours", body: "", update: requestRateLastDay }];
    
    $scope.tiles.forEach(tile => tile.update());
    $scope.tiles.forEach(tile => setInterval(() => tile.update(), 60000));
}]);
