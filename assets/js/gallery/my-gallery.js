'use strict';
/* global lcApp */
lcApp.controller('myGalleryCtr', ['$scope', function ($scope) {
    //init values
    $scope.galleries = [];
    //init galleries values
    $scope.initGalleries = function (gallery) {
        $scope.galleries.push(gallery);
    };
    //select gallery by _id
    var selectGallery = function (galleryId) {
        var allGalleryIds = [];
        $scope.galleries.forEach(function (eachGallery) {
            allGalleryIds.push(eachGallery._id);
        });
        $scope.currentGalleryIndex = allGalleryIds.indexOf(galleryId);
    };
    var $otherFeaturesBtn = $('.other-features-btn');
    var $removeGalleryModal = $('#removeGalleryModal');
    var $otherFeaturesModal = $('#otherFeaturesModal');
    var $removeGalleryBtn = $('.remove-gallery-btn');
    var $removeGalleryConfirmed = $('#remove-gallery-confirmed');
    var currentGalleryId = 0;
    $otherFeaturesBtn.on('click', function () {
        currentGalleryId = $(this).data('gallery');
        selectGallery(currentGalleryId);
        $otherFeaturesModal.modal('show');
        console.log($scope.galleries);
    });
    $removeGalleryBtn.on('click', function () {
        $removeGalleryModal.modal('show');
    });
    $removeGalleryConfirmed.on('click', function (event) {
        event.preventDefault();
        if($(this).hasClass('disabled')){
            window.alertModal('删除中，请稍等...');
        }else{
            $(this).addClass('disabled loading');
            $.post('/gallery/remove', {galleryId: currentGalleryId}, function (res, status) {
                if(status === 'success'){
                    if(res.state === 3){
                        $('#' + currentGalleryId).slideUp(function () {
                            $(this).remove();
                        });
                    }else{
                        window.alertModal('删除失败！');
                    }
                }else{
                    window.alertModal('网络错误，删除失败。');
                }
                $(this).removeClass('disabled loading');
                $removeGalleryModal.modal('hide');
            });
        }
    });
}]);
