var uploader = function (file, $dom) {
    this.file = file;
    this.$dom = $dom;
    this.deferred = $.Deferred();
};

uploader.prototype.upload = function () {
    var self = this;
    self.getOrientation(function () {
        self.showImage(function () {
            self.getUpToken(function () {
                self.uploadImage(function () {
                    self.saveImageInDatabase()
                });
            });
        });
    });

};

uploader.prototype.getOrientation = function (cb){
    var self = this;
    loadImage.parseMetaData(self.file, function (data) {
        var orientation = data.exif.get('Orientation');
        if(orientation){
            self.orientation = orientation;
            cb();
        }
    });
};
uploader.prototype.showImage = function (cb){
    var self = this;
    loadImage(
        this.file,
        function(img){
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
            self.$dom.append($previewHtml);
            self.$dom.find('p').remove();
            $previewHtml.fadeIn('slow');
            self.$preview =  $previewHtml;
            cb();
        },
        {
            orientation:self.orientation,
            canvas:true
        }
    );
};
uploader.prototype.uploadImage = function (cb){
    var self = this;
    var xhr = new XMLHttpRequest();
    var fd = new FormData();
    xhr.open('POST', 'http://upload.qiniu.com', true);
    xhr.onreadystatechange = function(){
        if(xhr.readyState === 4 && xhr.status === 200){
            self.uploadResponse = JSON.parse(xhr.response);
            self.$preview.attr('id',self.uploadResponse.hash);
            self.$preview.find('.progress').slideUp();
            cb();
        }
    };
    fd.append('token', self.upToken);
    fd.append('file', self.file);
    xhr.send(fd);
};
uploader.prototype.getUpToken = function (cb){
    var self = this;
    $.get('/cdn/uptoken', function(data, status){
        if(status === 'success'){
            self.upToken = data.uptoken;
            cb();
        }else{
            alert('获取上传Token时发生网络错误。');
        }
    });
};
uploader.prototype.saveImageInDatabase = function (){
    var self = this;
    var response = self.uploadResponse;
    var postData = {};
    postData.hash = response.hash;
    postData.key = response.key;
    postData.galleryId = $('#gallery-id').data('galleryId');
    console.log(postData);
    $.post('/gallery/save-image', postData, function (data, status) {
        if(status === 'success'){
            console.log(data);
        }else{
            alert('Sorry,保存相册到数据库的时候出现网络错误了...');
        }
    });
};
uploader.prototype.removeItem = function (){
    var self = this;
    self.getUpToken(function () {

    });
};