'use strict';
$(document).ready(function () {
    //init dom
    var $uploadButton = $('#upload-button');
    var $uploadBox = $('#upload-box');
    var $uploadInput = $('#upload-input');
    var $images = $('#images');
    var $lovelyLink = $('#lovely-link');
    var $lovelyLinkModal = $('#lovely-link-modal');
    var $removeImageButton = $('#remove-image-button');
    var $showImageModal = $('#show-image-modal');
    var $galleryId = $('#gallery-id');
    //images uploader
    (function () {
        //trigger input click event
        $uploadBox.on('click', function (event) {
            event.preventDefault();
            $uploadInput.trigger('click');
        });
        $uploadButton.on('click', function (event) {
            event.preventDefault();
            $uploadInput.trigger('click');
        });
        $uploadInput.on('change', function () {
            var files = this.files;
            var galleryId = $galleryId.data('galleryId');
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                var imageUploader = new Uploader(file, $images);
                imageUploader.upload();
            }
        });
    })();
    //lovely link
    $lovelyLink.on('click', function (event) {
        event.preventDefault();
        $lovelyLinkModal.modal('show');
    });

    //show image
    var imgSrc;
    var $modalImg;
    var $modalBody = $showImageModal.find('.modal-body');
    $(document).on('click', '.thumbnail', function (event) {
        event.preventDefault();
        if($(this).hasClass('uploading')){
            window.alertModal('上传中，请稍等~');
        }else{
            var fileName = $(this).attr('data-name');
            imgSrc = '//cdn.lazycoffee.com/' + $(this).attr('data-key') + '_w868';
            $modalImg = $('<img src="' + imgSrc + '" alt="' + fileName + '" />').hide();
            var key = $(this).attr('data-key');
            $modalBody.html('<span class="glyphicon glyphicon-refresh spin" aria-hidden="true"></span>');
            $showImageModal.find('[data-key]').attr('data-key', key);
            $showImageModal.find('.modal-title').text(fileName);
            $showImageModal.modal('show');
        }
    });
    $showImageModal.on('shown.bs.modal', function () {
        $modalBody.html('').prepend($modalImg);
        $showImageModal.imagesLoaded(function () {
            var windowHeight = $(window).height();
            $modalImg.css({'max-height': windowHeight - 150});
            $modalImg.slideDown();
        });
    });
    //remove image
    $(document).on('click', '[data-action=deleteItem]', function (event) {
        event.preventDefault();
        var key = $(this).attr('data-key');
        var successStatus = [2, 4, 6, 7];
        var uploader = new Uploader();
        $removeImageButton.html('<span class="glyphicon glyphicon-refresh spin" aria-hidden="true"></span>').prop('disabled', true);
        uploader.removeItem(key, function (data) {
            if (successStatus.indexOf(data.state) === -1) {
                $removeImageButton.html('删除失败').prop('disabled', true);
            } else {
                $removeImageButton.html('删除成功').prop('disabled', false);
                $showImageModal.modal('hide');
                $('[data-key=' + key + ']').closest('.image').fadeOut(function () {
                    $(this).remove();
                });
            }
        });
    });
    $showImageModal.on('hidden.bs.modal', function () {
        $removeImageButton.text('删除').prop('disabled', false);
        $modalBody.html('<span class="glyphicon glyphicon-refresh spin" aria-hidden="true"></span>');
    });
});
