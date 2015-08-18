'use strict';
$(document).ready(function () {
    //config
    moment.locale('zh-cn');
    //alert modal
    var $alertModal = $('#alertModal');
    window.alertModal = function (content, title) {
        var modalTitle = title || '提示';
        $alertModal.find('.content').html(content);
        $alertModal.find('.header').text(modalTitle);
        $alertModal.modal('show');
    };
    $alertModal.on('hidden.bs.modal', function () {
        $alertModal.find('.modal-body').html('');
        $alertModal.find('.header').text('提示');
    });
    //enable semantic ui features
    $('.ui.checkbox').checkbox();
    $('.ui.dropdown').dropdown();
});
