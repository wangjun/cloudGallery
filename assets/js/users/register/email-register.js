'use strict';
$(document).ready(function () {
    var $nextStepBtn = $('#email-register-next-btn');
    var $emailInput = $('#email-register-input');
    var submit = function () {
        var inputVal = $emailInput.val();
        $nextStepBtn.html('<div class="ui active mini inline loader"></div>').prop('disabled', true);
        $.post('/users/email/register', {
            email: inputVal
        }, function (data, status) {
            console.log(data);
            if (status === 'success') {
                if (data.state === 2) {
                    window.location.href = '/users/email/sent';
                } else if (data.state === 3) {
                    window.location.reload(true);
                }
            } else {
                console.log('网络错误');
            }
        });
    };
    $nextStepBtn.on('click', function (event) {
        event.preventDefault();
        submit();
    });
    var isPopup = false;
    $emailInput.on('keypress', function (event) {
        if(event.keyCode === '13'){
            event.preventDefault();
            submit();
        }else{
            var inputVal = $emailInput.val();
            var isEmail = validator.isEmail(inputVal);
            if (isEmail) {
                $nextStepBtn.prop('disabled', false);
                isPopup = false;
                $emailInput.popup('destroy');
            } else {
                $nextStepBtn.prop('disabled', true);
                if (isPopup === false) {
                    $emailInput.popup({
                        content: '邮箱格式不正确',
                        trigger: 'manual',
                        onShow: function () {
                            isPopup = true;
                        }
                    }).popup('show');
                }
            }
        }
    });
});
