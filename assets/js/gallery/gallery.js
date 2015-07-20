'use strict';
$(document).ready(function(){
    //init dom
    var $uploadButton = $('#upload-button');
    var $uploadBox = $('#upload-box');
    var $uploadInput = $('#upload-input');
    var $images = $('#images');
    var $lovelyLink = $('#lovely-link');
    var $lovelyLinkModal = $('#lovely-link-modal');
    var $removeImageButton = $('#remove-image-button');
    var $showImageModal = $('#show-image-modal');

    //images uploader
    (function(){
        //trigger input click event
        $uploadBox.on('click', function (event) {
            event.preventDefault();
            $uploadInput.trigger('click');
        });
        $uploadButton.on('click', function (event) {
            event.preventDefault();
            $uploadInput.trigger('click');
        });
        $uploadInput.on('change', function(){
            var files = this.files;
            for (var i = 0; i < files.length; i++){
                var file = files[i];
                var imageUploader = new Uploader(file, $images);
                imageUploader.upload();
            }
        });
    })();

    //lovely link
    (function () {
        $lovelyLink.on('click', function (event) {
            event.preventDefault();
            $lovelyLinkModal.modal('show');
        });
    })();

    //remove image
    (function () {
        $(document).on('click', '[data-action=deleteItem]', function (event) {
            event.preventDefault();
            var hash = $(this).attr('data-hash');
            var successStatus = [2, 4, 6, 7];
            var uploader = new Uploader();
            $removeImageButton.html('<span class="glyphicon glyphicon-refresh spin" aria-hidden="true"></span>');
            uploader.removeItem(hash, function (data) {
                if(successStatus.indexOf(data.state) === -1){
                    $removeImageButton.html('删除失败').prop('disable', true);
                }else{
                    $removeImageButton.html('删除成功').prop('disable', true);
                    $showImageModal.modal('hide');
                    $('[data-hash=' + hash + ']').closest('.image').fadeOut(function () {
                        $(this).remove();
                    });
                }
            });
        });
    })();

    (function(){
        $showImageModal.on('hide.bs.modal', function () {
            $removeImageButton.text('删除').prop('disable', false);
        });
    })();

    //show image
    (function () {
        $(document).on('click', '.thumbnail', function (event) {
            event.preventDefault();
            var $img = $(this).find('img');
            var imgSrc = $img.attr('src');
            var imgAlt = $img.attr('alt');
            var hash = $(this).attr('data-hash');
            var fileName = $(this).attr('data-name');
            $showImageModal.find('img').attr({src: imgSrc, alt: imgAlt});
            $showImageModal.find('[data-hash]').attr('data-hash', hash);
            $showImageModal.find('.modal-title').text(fileName);
            $showImageModal.modal('show');
        });
    })();
});
