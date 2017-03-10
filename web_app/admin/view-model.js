var bandcampMultiTag = angular.module('adminApp', []);

function Tag(name) {
    this.name = name;
    this.isCaching = false;
}

bandcampMultiTag.controller('adminController', function ($scope) {
    $scope.adress = "bandcamptagsearch.tech";
    $scope.port = 3000;

    var cachedTagsFunc = function() {
        $scope.$apply(() => {
            this.body = this.body + 1;
        })
    }

    $scope.tiles = [
        { header: "Cached tags", body: 2100, update: cachedTagsFunc },
        { header: "Currently caching", body: "ambient" },
        { header: "Requests per second", body: "3.14" }];
    
    setInterval(() => $scope.tiles[0].update(), 1000);

  	$scope.addInputTag = function() {
  	    var newTag = $scope.newTag.replace(" ", "-");
  	    $scope.addTag(newTag);
  	    $scope.newTag = null;
        $scope.updateUserSearchCount();
   	};
});