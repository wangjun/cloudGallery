$(document).ready(function () {
    $('#phone-register-wrap').popup({
        variation:'inverted',
        content: '抱歉，此功能尚在开发中...',
        position: 'top center'
    });
    $('#weibo-register-button')
        .popup({
            content: '新浪微博',
            position: 'top center'
        })
        .on('click', function () {
            $.post('https://api.weibo.com/oauth2/authorize',{
                    client_id: '2521804735',
                    redirect_url: '//www.lazycoffee.com/users/society/weibo/register'
                }, function (data, status) {
                    console.log(data);
                    console.log(status);
                }
            );
        });
});