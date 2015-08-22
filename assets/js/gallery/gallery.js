$(document).ready(function () {
    'use strict';
    //init dom
    var $uploadButton = $('#upload-button');
    var $uploadInput = $('#upload-input');
    var $images = $('#images');
    var $removeImageButton = $('#remove-image-button');
    var $showImageModal = $('#show-image-modal');
    var $galleryId = $('#gallery-id');
    var galleryId = $galleryId.data('galleryId');
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
    var imgSrc;
    $(document).on('click', '.image', function (event) {
        event.preventDefault();
        if($(this).hasClass('uploading')){
            window.alertModal('上传中，请耐心等待...');
        }else{
            var fileName = $(this).attr('data-name');
            imgSrc = '//cdn.lazycoffee.com/' + $(this).attr('data-key') + '_w868';
            var key = $(this).attr('data-key');
            $showImageModal.find('[data-key]').attr('data-key', key);
            $showImageModal.find('.header').text(fileName);
            $showImageModal.find('img').attr('src', imgSrc);
            imagesLoaded($showImageModal.find('img').get(0), function () {
                $showImageModal.modal('show');
            });

        }
    });
    //remove image
    $(document).on('click', '[data-action=deleteItem]', function (event) {
        event.preventDefault();
        var key = $(this).attr('data-key');
        var successStatus = [2, 4, 6, 7];
        var uploader = new Uploader();
        $removeImageButton.html('<span class="glyphicon glyphicon-refresh spin" aria-hidden="true"></span>').prop('disabled', true);
        uploader.removeItem(key, galleryId, function (data) {
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
    });
    $images.masonry({
        // set itemSelector so .grid-sizer is not used in layout
        itemSelector: '.card',
        percentPosition: true
    })
});
