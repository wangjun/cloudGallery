var uploader = function (file, $dom) {
    this.file = file;
    this.$dom = $dom;
};

uploader.prototype.upload = function () {
    this.getOrientation();
    this.showImage();
    this.getUpToken();
    this.uploadImage();
    this.saveImageInDatabase();
};

uploader.prototype.getOrientation = function (){
    var self = this;
    loadImage.parseMetaData(this.file, function (data) {
        var orientation = data.exif.get('Orientation');
        if(orientation){
            self.orientation = orientation;
        }
    });
};
uploader.prototype.showImage = function (){
    var self = this;
    loadImage(
        this.file,
        function(img){
            self.$previewHtml = $('<div/>');
            self.$previewHtml.addClass('col-xs-12 col-sm-4 image')
                .append('<a/>')
                .find('a')
                .addClass('thumbnail')
                .append(img)
                .append('<div class="progress">' +
                '<div class="progress-bar progress-bar-striped active" style="width:100%;">' +
                '上传中...' +
                '</div>' +
                '</div>');
            self.$previewHtml.css({'display':'none'});
            self.$dom.append(self.$previewHtml);
            self.$previewHtml.fadeIn('slow');
        },
        {
            orientation:self.orientation,
            canvas:true
        }
    );
};
uploader.prototype.uploadImage = function (){
    var self = this;
    var xhr = new XMLHttpRequest();
    var fd = new FormData();
    xhr.open('POST', 'http://upload.qiniu.com', true);
    xhr.onreadystatechange = function(){
        if(xhr.readyState === 4 && xhr.status === 200){
            self.saveImageInDatabase(JSON.parse(xhr.response));
        }
    };
    fd.append('token', self.upToken);
    fd.append('file', self.file);
    xhr.send(fd);
};
uploader.prototype.getUpToken = function (){
    var self = this;
    $.get('/cdn/uptoken', function(data, status){
        if(status === 'success'){
            self.upToken = data.uptoken;
        }
    });
};
uploader.prototype.saveImageInDatabase = function (response){
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
