$(document).ready(function () {
    'use strict';
    var $registerForm = $('#register');
    var $getMobileCaptcha = $registerForm.find('#get-mobile-captcha');
    var getMobileCaptchaText = $getMobileCaptcha.text();
    var $modal = $('#modal');
    var $modalOkTtn = $modal.find('#ok');

    //render modal
    function createModal() {
        $.get('/utility/i-am-not-a-robot', function (data, status) {
            if (status) {
                $modal.find('.modal-title').text('请输入验证码');
                var modalBodyHtml =
                    '<form action="/utility/check-captcha" method="POST" id="captcha-form" class="form-horizontal">' +
                    '<input type="hidden" name="_csrf" id="csrf-token" value="' + data.csrfToken + '">' +
                    '<div class="form-group">' +
                    '<div class="col-sm-12">' + data.captchaHtml + '</div>' +
                    '</div>' +
                    '<div class="form-group">' +
                    '<label class="col-sm-2 control-label" for="mobile">验证码</label>' +
                    '<div class="col-sm-10">' +
                    '<input name="captcha-text" type="tel" class="form-control" id="captcha-text" placeholder="请输入上方验证码">' +
                    '</div>' +
                    '<span class="help-block col-sm-offset-2 col-sm-10"></span>' +
                    '</div>' +
                    '</form>';
                $modal.find('.modal-body').html(modalBodyHtml);
            } else {
                console.error('网站或网络错误，无法继续');
            }
        });
    }

    //disable send sms button
    function disableSms(countTime) {
        countTime = countTime || 60;
        $getMobileCaptcha.prop('disabled', true);
        var waiteTime = countTime;
        var countDown = setInterval(function () {
            $getMobileCaptcha.text(waiteTime + '秒后重新发送');
            waiteTime--;
            if (waiteTime === 0) {
                clearInterval(countDown);
                $getMobileCaptcha.prop('disabled', false).text(getMobileCaptchaText);
            }
        }, 1000);
    }

    //send sms
    function sendSms(countTime) {
        //disable send button until a certain time
        disableSms(countTime);
        //sms request
        $.post('/utility/send-sms',
            {
                mobile: '18675959065'
            },
            function (data, status) {
                if (status) {
                    console.log(data);
                } else {
                    console.log('请求短信发送服务器失败');
                }
            }
        );
    }

    //open modal
    $getMobileCaptcha.on('click', function (event) {
        event.preventDefault();
        $.get('/utility/check-is-human', function (data, status) {
            if (status) {
                if (data.isHuman) {
                    sendSms();
                } else {
                    $modal.modal('show');
                    createModal();
                }
            }
        });
    });

    //check is human, if yes, send sms
    $modalOkTtn.on('click', function () {
        var captchaText = $modal.find('#captcha-text').val();
        var csrfToken = $modal.find('#csrf-token').val();
        $.post('/utility/check-captcha', {
            _csrf: csrfToken,
            captchaText: captchaText
        }, function (data, status) {
            if (status === 'success') {
                if (data.isHuman) {
                    $modal.modal('hide');
                    sendSms();
                } else {
                    createModal();
                    $modal.find('.help-block').text('验证码错误，请重新输入');
                }
            } else {
                console.log('网站或网络错误，无法继续。');
            }
        });
    });

    //checking waiting time
    $.get('/utility/is-allowed-to-send-sms', function (data, status) {
        if (status === 'success') {
            if (data.status) {
                return false;
            } else {
                if ($.isNumeric(data.reason)) {
                    disableSms(parseInt(data.reason));
                } else {
                    console.log(data.reason);
                }
            }
        } else {
            console.log('网络错误。');
        }

    });
});
