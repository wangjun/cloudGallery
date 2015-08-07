'use strict';
$(document).ready(function () {
    var $alertModal = $('#alertModal');
    window.alertModal = function (content, title) {
        var modalTitle = title || '提示';
        $alertModal.find('.modal-body').html(content);
        $alertModal.find('#alertModalLabel').text(modalTitle);
        $alertModal.modal('show');
    };
    $alertModal.on('hidden.bs.modal', function () {
        $alertModal.find('.modal-body').html('');
        $alertModal.find('#alertModalLabel').text('提示');
    });
    $('.ui.checkbox').checkbox();
});
