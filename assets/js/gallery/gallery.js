'use strict';
/* global Uploader */
$(document).ready(function () {
    //init dom
    var $uploadButton = $('#upload-button');
    var $uploadInput = $('#upload-input');
    var $images = $('#images');
    var $removeImageButton = $('#remove-image-button');
    var $showImageModal = $('#show-image-modal');
    var $galleryId = $('#gallery-id');
    var galleryId = $galleryId.data('galleryId');
    var currentSelected = {};
    /* images uploader */
    //trigger input click event
    //var $uploadBox = $('#upload-box');
    //$uploadBox.on('click', function (event) {
    //    event.preventDefault();
    //    $uploadInput.trigger('click');
    //});
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
            //currentSelected.fileName = $(this).attr('data-name');
            //currentSelected.imgSrc = '//cdn.lazycoffee.com/' + $(this).attr('data-key') + '_w900';
            //currentSelected.key = $(this).attr('data-key');
            //currentSelected.hash = $(this).attr('data-hash');
            //$showImageModal.find('.header').text(currentSelected.fileName);
            //$showImageModal.find('img').attr('src', currentSelected.imgSrc);
            //$showImageModal.imagesLoaded(function () {
            //    $showImageModal.modal('show');
            //});
            $showImageModal.modal('show');
            $('.main-gallery').flickity({
                // options
                cellAlign: 'left',
                contain: true,
                freeScroll: true,
                pageDots: false
            });
        }
    });
    //remove image
    $(document).on('click', '[data-action=deleteItem]', function (event) {
        event.preventDefault();
        var successStatus = [1, 2, 4, 5, 7];
        var uploader = new Uploader();
        $removeImageButton.addClass('loading disabled');
        uploader.removeItem(currentSelected.key, galleryId, function (data) {
            if (successStatus.indexOf(data.state) === -1) {
                $removeImageButton.html('删除失败').addClass('disabled');
            } else {
                $removeImageButton.html('删除成功').removeClass('disabled');
                $showImageModal.modal('hide');
                //$('.card[data-hash=' + hash + ']').remove();
                window.$imagesLayout.masonry('remove', $('.card[data-hash=' + currentSelected.hash + ']')).masonry('layout');
            }
        });
    });
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
        percentPosition: true
    });
    // layout Masonry after each image loads
    window.$imagesLayout.imagesLoaded().progress(function () {
        window.$imagesLayout.masonry('layout');
    });
});
