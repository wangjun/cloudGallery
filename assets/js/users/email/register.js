'use strict';
$(document).ready(function () {
    var $nextStepBtn = $('#email-register-next-btn');
    var $emailInput = $('#email-register-input');
    var submit = function () {
        var inputVal = $emailInput.val();
        var isEmail = validator.isEmail(inputVal);
        if (isEmail) {
            $emailInput.popup('hide');
            $nextStepBtn.addClass('loading').prop('disabled', true);
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
        } else {
            $emailInput.popup({
                content: '邮箱格式不正确',
                trigger: 'manual'
            }).popup('show');
            return false;
        }
    };
    $nextStepBtn.on('click', function (event) {
        event.preventDefault();
        submit();
    });
    $emailInput.on('input', function (event) {
        if(event.keyCode === '13'){
            submit();
        }
        $emailInput.popup('hide');
    });
});
