$(document).ready(function () {
    'use strict';
    var $otherFeaturesBtn = $('.other-features-btn');
    var $removeGalleryModal = $('#removeGalleryModal');
    var $otherFeaturesModal = $('#otherFeaturesModal');
    var $removeGalleryBtn = $('.remove-gallery-btn');
    var $removeGalleryConfirmed = $('#remove-gallery-confirmed');
    var currentGalleryId = 0;
    $otherFeaturesBtn.on('touchstart click', function () {
        currentGalleryId = $(this).data('gallery');
        $otherFeaturesModal.modal('show');
    });
    $removeGalleryBtn.on('touchstart click', function () {
        $removeGalleryModal.modal('show');
    });
    $removeGalleryConfirmed.on('touchstart click', function (event) {
        event.preventDefault();
        if($(this).hasClass('disabled')){
            window.alertModal('删除中，请稍等...');
        }else{
            var thisDefaultText = $(this).html();
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
});
