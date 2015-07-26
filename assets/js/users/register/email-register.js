'use strict';
$(document).ready(function () {
    var $nextStepBtn = $('#email-register-next-btn');
    var $emailInput = $('#email-register-input');
    var $nextStepWrapper = $('#next-btn-wrapper');
    $nextStepBtn.on('click', function (event) {
        event.preventDefault();
        var inputVal = $emailInput.val();
        $.post('/users/email-register', {
            email: inputVal
        }, function (data, status) {
            console.log(data);
            if(status === 'success'){
                if(data.state === 2){
                    window.location.href = '/users/email-register/email-sent';
                }else if(data.state === 3){
                    window.location.reload(true);
                }
            }else{
                console.log('网络错误');
            }
        });
    });
    $emailInput.on('input', function () {
        var inputVal = $emailInput.val();
        var isEmail = validator.isEmail(inputVal);
        if (isEmail) {
            $nextStepBtn.prop('disabled', false);
            $nextStepWrapper.tooltip('destroy');
        } else {
            $nextStepBtn.prop('disabled', true);
            $nextStepWrapper.tooltip({
                    title: '邮箱地址不正确',
                    trigger: 'hover'
                });
        }
    });
});
