'use strict';
/* global Uploader lcApp */
lcApp.controller('galleryCtr', ['$scope', function ($scope) {
    //init dom
    var $uploadButton = $('#upload-button');
    var $uploadInput = $('#upload-input');
    var $images = $('#images');
    var $removeImageButton = $('#remove-image-button');
    var $showImageModal = $('#show-image-modal');
    var galleryId = $scope.galleryId;
    var currentSelected = {};
    var $mainGallery = $('.main-gallery');
    $uploadButton.on('click', function (event) {
        event.preventDefault();
        $uploadInput.trigger('click');
    });
    $uploadInput.on('change', function () {
        var files = this.files;
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var imageUploader = new Uploader(file, $images);
            imageUploader.upload();
        }
    });

    //show image
    $(document).on('click', '.card', function (event) {
        event.preventDefault();
        if ($(this).hasClass('uploading')) {
            window.alertModal('上传中，请耐心等待...');
        } else {
            $showImageModal.modal({
                onVisible: function () {
                    $mainGallery.flickity('resize');
                }
            }).modal('show');
        }
    });
    //remove image
    $scope.removeImage = function () {
        var successStatus = [1, 2, 4, 5, 7];
        var uploader = new Uploader();
        $removeImageButton.addClass('loading disabled');
        uploader.removeItem($scope.currentImageHash, galleryId, function (data) {
            if (successStatus.indexOf(data.state) === -1) {
                $removeImageButton.html('删除失败').addClass('disabled');
            } else {
                //reLayout masonry
                window.$imagesLayout.masonry('remove', $('.card[data-hash=' + currentSelected.hash + ']')).masonry('layout');
            }
        });
    };
    $('#hide-image-modal').on('click', function (event) {
        event.preventDefault();
        $showImageModal.modal('hide');
    });
    $showImageModal.modal({
        onHidden: function () {
            $removeImageButton.removeClass('loading disabled');
            $removeImageButton.html('删除');
        }
    });
    $('#weibo-share-btn').on('click', function (event) {
        event.preventDefault();
        $.post('/society/weibo/share', {
            content: 'testing'
        }, function (data, status) {
            if(status === 'success'){
                if(data.state === 4){
                    window.alertModal('你尚未登录。');
                }
                console.log(data);
            }
        });
    });
    // init Masonry
    window.$imagesLayout = $images.masonry({
        itemSelector: '.card',
        percentPosition: false
    });
    // layout Masonry after each image loads
    window.$imagesLayout.imagesLoaded().progress(function () {
        window.$imagesLayout.masonry('layout');
    });
    //flickity init
    $mainGallery.flickity({
        // options
        pageDots: false,
        percentPosition: false,
        imagesLoaded: true,
        setGallerySize: false
    });
    //show image
    $scope.selectImage = function (imageHash, imageIndex) {
        var index = parseInt(imageIndex);
        $scope.currentImageHash = imageHash;
        $mainGallery.flickity('select', index);
    };
}]);
