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
        });
        //.on('click', function () {
        //    $.ajax('https://api.weibo.com/oauth2/authorize', {
        //        crossDomain: true,
        //        type: 'POST',
        //        dataType: 'json',
        //        xhrFields: {
        //            withCredentials: true
        //        },
        //        header: {
        //            'Access-Control-Allow-Origin': '*'
        //        },
        //        data: {
        //            client_id: '2521804735',
        //            redirect_url: '//lazycoffee.com:3100/users/society/weibo/register'
        //        },
        //        success: function (data, status) {
        //            console.log(data);
        //            console.log(status);
        //        }
        //    });
        //});
});