'use strict';
window.image = {};
window.image.uploadImage = function (file, galleryId) {
    $.get('/cdn/uptoken', function (tokenRes, status) {
        if(status === 'success'){
            var xhr = new XMLHttpRequest();
            var fd = new FormData();
            xhr.open('POST', 'http://upload.qiniu.com');
            xhr.onreadystatechange = function () {
                if(xhr.readyState === 4 && xhr.status === 200){
                    var uploadRes = JSON.parse(xhr.response);
                    $.post('/image/save', {
                            hash: uploadRes.hash,
                            key: uploadRes.key,
                            galleryId: galleryId,
                            fileName: file.name
                        }, function (saveRes, saveStatus) {
                            if(saveStatus === 'success'){
                                console.log(saveRes);
                            }
                        });
                    console.log(uploadRes, galleryId);
                }
            };
            fd.append('token', tokenRes.uptoken);
            fd.append('file', file);
            xhr.send(fd);
        }else{
            window.alertModal('网络错误，无法获取上传凭证。');
        }
    });
};
