'use strict';
$(document).ready(function(){
    //initiate dom
    var $password = $('#password');
    var $rePassword = $('#re-password');
    var $emailRegisterStep2Btn = $('#email-register-step2-btn');
    //initiate variables
    var password;
    var rePassword;
    var isPasswordGood;
    var isRePasswordGood;
    //initiate status
    $emailRegisterStep2Btn.prop('disabled', true);
    //functions
    function checkIsSame(){
        return password === rePassword;
    }
    function checkButton(){
        if(isPasswordGood && isRePasswordGood && checkIsSame()){
            $password.tooltip('destroy');
            $rePassword.tooltip('destroy');
            $emailRegisterStep2Btn.prop('disabled', false);
        }else{
            $emailRegisterStep2Btn.prop('disabled', true);
        }
    }
    //dom event
    $password.on('input', function () {
        password = $(this).val();
        if(validator.isLength(password, 7, 20)){
            $(this).data('bs.tooltip', false);
            isPasswordGood = true;
        }else{
            $(this).tooltip({
                title: '密码长度在7-20位之间',
                placement: 'right'
            }).tooltip('show');
            isPasswordGood = false;
        }
        checkButton();
    });
    $rePassword.on('input', function () {
        rePassword = $(this).val();
        if(validator.equals(rePassword, password)){
            $(this).tooltip('destroy');
            isRePasswordGood = true;
        }else{
            $(this).tooltip({
                title: '确认密码与密码不一致',
                placement: 'right'
            }).tooltip('show');
            isRePasswordGood = false;
        }
        checkButton();
    });
    $emailRegisterStep2Btn.on('click', function (event) {
        event.preventDefault();
        var postDate = {
            password: password,
            rePassword: rePassword
        };
        $.post('/users/email/register/step2', postDate, function (data, status) {
            if(status === 'success'){
                console.log(data);
                if(data.state === 1){
                    window.location.href = '/users';
                }
            }else{
                console.log('网络错误');
            }
        });
    });
});
