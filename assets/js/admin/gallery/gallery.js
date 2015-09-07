'use strict';
/* global lcApp */
lcApp.controller('galleryCtr', ['$scope', '$http', function ($scope, $http) {
    $scope.cleanGallery = function () {
        $scope.isLoading = 'loading';
        $http.post('/admin/gallery/clean', {galleryId: $scope.galleryId})
            .then(function (response) {
                $scope.imagesNum = response.data.images.length;
                $scope.isLoading = '';
                if($scope.imagesNum === $scope.imagesRealNum){
                    $scope.isLoading = 'disabled';
                }
            });
    };
    if($scope.imagesNum === $scope.imagesRealNum){
        $scope.isLoading = 'disabled';
    }
}]);
