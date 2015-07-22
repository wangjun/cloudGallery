$(document).ready(function () {
    var $emailRegisterStep1 = $('#email-form-step1');
    var $emailRegisterStep2 = $('#email-form-step2');
    var $nextStepBtn = $('#email-register-next-btn');
    var $emailInput = $('#email-register-input');
    var $nextStepWrapper = $('#next-btn-wrapper');
    var wizard = new Wizard($('.wizard'));
    $nextStepBtn.on('click', function (event) {
        event.preventDefault();
        var inputVal = $emailInput.val();
        $.post('/users/email-register', {
            email: inputVal
        }, function (data, status) {
            console.log(data);
            if(status === 'success'){
                if(data.state === 2){
                    wizard.nextStep();
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