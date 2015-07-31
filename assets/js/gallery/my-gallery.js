'use strict';
$(document).ready(function () {
    var $removeGalleryModal = $('#removeGalleryModal');
    var $otherFeaturesModal = $('#otherFeaturesModal');
    var currentGalleryId = 0;
    $otherFeaturesModal.on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget);
        currentGalleryId = button.data('gallery');
    });
    $('#remove-gallery-confirmed').on('click', function (event) {
        event.preventDefault();
        console.log(currentGalleryId);
        var thisDefaultText = $(this).text();
        $(this).prop('disabled', true).html('<span class="glyphicon glyphicon-refresh spin" aria-hidden="true"></span>');
        $.post('/gallery/remove', {galleryId: currentGalleryId}, function (res, status) {
            if(status === 'success'){
                if(res.state === 3){
                    $('#' + currentGalleryId).fadeOut();
                }else{
                    window.alertModal('删除失败！');
                }
            }else{
                window.alertModal('网络错误，删除失败。');
            }
            $(this).prop('disabled', false).html(thisDefaultText);
            $removeGalleryModal.modal('hide');
        });
    });
});
