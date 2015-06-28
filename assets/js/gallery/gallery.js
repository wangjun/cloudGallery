$(document).ready(function(){
    //init dom
    var $uploadButton = $('#upload-button');
    var $uploadBox = $('#upload-box');
    var $uploadInput = $('#upload-input');
    var $images = $('#images');
    var $lovelyLink = $('#lovely-link');
    var $lovelyLinkModal = $('#lovely-link-modal');

    //images uploader
    (function(){
        //init variables
        var orientation = '';
        //trigger input click event
        $uploadBox.on('click', function (event) {
            event.preventDefault();
            $uploadInput.trigger('click');
        });
        $uploadButton.on('click', function (event) {
            event.preventDefault();
            $uploadInput.trigger('click');
        });
        $uploadInput.on('change', function(){
            var files = this.files;
            for (var i=0;i<files.length;i++){
                var file = files[i];
                function getOrientation(file, callback){
                    loadImage.parseMetaData(file, function (data) {
                        orientation = data.exif.get('Orientation');
                        if(orientation){
                            callback(file,orientation);
                        }
                    });
                }
                function showImage(file, orientation){
                    loadImage(
                        file,
                        function(img){
                            var reader = new FileReader();
                            reader.addEventListener('load', function (event) {
                                var buffer = event.target.result;
                                var imageHash = new hash(buffer);
                                imageHash.getHash();
                            });
                            reader.readAsArrayBuffer(file);
                            var $previewHtml = $('<div/>');
                            $previewHtml.addClass('col-xs-12 col-sm-4 image')
                                .append('<a/>')
                                .find('a')
                                .addClass('thumbnail')
                                .append(img)
                                .append('<div class="progress">' +
                                '<div class="progress-bar progress-bar-striped active" style="width:100%;">' +
                                '上传中...' +
                                '</div>' +
                                '</div>');
                            $previewHtml.css({'display':'none'});
                            $images.append($previewHtml);
                            $previewHtml.fadeIn('slow');
                        },
                        {
                            orientation:orientation,
                            canvas:true
                        }
                    );
                }
                function uploadImage(file){
                    getUpToken(function(uptoken){
                        var xhr = new XMLHttpRequest();
                        var reader = new FileReader();
                        var fd = new FormData();
                        var fileSize = file.size;
                        xhr.open('POST', 'http://upload.qiniu.com', true);
                        xhr.onreadystatechange = function(){
                            if(xhr.readyState === 4 && xhr.status === 200){
                                saveImageInDatabase(JSON.parse(xhr.response));
                            }
                        };
                        reader.addEventListener('load', function (event) {
                            var fileBinary = event.target.result;
                            //xhr.setRequestHeader('Content-Type','application/octet-stream');
                            //xhr.setRequestHeader('Authorization','UpToken '+uptoken);
                            //fd.append('fileBinaryData', fileBinary);

                            fd.append('token', uptoken);
                            fd.append('file', file);
                            xhr.send(fd);
                        });
                        reader.readAsBinaryString(file);
                    });
                }
                function getUpToken(callback){
                    $.get('/cdn/uptoken', function(data, status){
                        if(status === 'success'){
                            callback(data.uptoken);
                        }
                    });
                }
                function saveImageInDatabase(response){
                    console.log(response);
                    var postData = {};
                    postData.hash = response.hash;
                    postData.key = response.key;
                    postData.galleryId = $('#gallery-id').data('galleryId');
                    $.post('/gallery/save-image', postData, function (data, status) {
                        if(status === 'success'){
                            console.log(data);
                        }else{
                            alert('Sorry,保存相册到数据库的时候出现网络错误了...');
                        }
                    });
                }
                getOrientation(file, function (file, orientation) {
                    showImage(file, orientation);
                    uploadImage(file);
                });
            }
        });
    })();

    //lovely link
    (function () {
        $lovelyLink.on('click', function (event) {
            event.preventDefault();
            $lovelyLinkModal.modal('show');
        })
    })();
});

//angular controller
(function(){

})();