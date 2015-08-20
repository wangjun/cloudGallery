'use strict';
var Uploader = function (file, $dom) {
    this.file = file || null;
    this.$dom = $dom || null;
    this.removeUrl = '/gallery/remove-image';
    this.getUpTokenUrl = '/cdn/uptoken';
    this.uploadUrl = 'http://upload.qiniu.com';
};

Uploader.prototype.upload = function () {
    var self = this;
    self.getOrientation(function () {
        self.showImage(function () {
            self.getUpToken(function () {
                self.uploadImage(function () {
                    self.saveImageInDatabase();
                });
            });
        });
    });
};

Uploader.prototype.getOrientation = function (cb){
    var self = this;
    loadImage.parseMetaData(self.file, function (data) {
        var exif = data.exif.getAll();
        var orientation = data.exif.get('Orientation');
        if(orientation){
            self.orientation = orientation;
            self.exif = exif;
            cb();
        }else{
            console.log('this is not a photo.');
        }
    });
};
Uploader.prototype.showImage = function (cb){
    var self = this;
    loadImage(
        this.file,
        function(img){
            $('#no-image-gallery').remove();
            var date = moment(self.exif.DateTime, 'YYYY:MM:DD HH:mm:ss').format('LL');
            var $previewHtml = $('<div/>');
            $previewHtml.addClass('card')
                .append('<div class="image"></div>')
                .append('<div class="content">' +
                '<span class="header">' + self.file.name + '</span>' +
                '<div class="meta">' +
                '<span class="date">摄于' + date + '</span>' +
                '</div>' +
                '</div>')
                .append('<div class="ui bottom attached progress active yellow" data-percent="0">' +
                '<div class="bar" style="width:0;"></div>' +
                '</div>');
            $previewHtml.find('.image').append(img);
            self.$dom.append($previewHtml);
            self.$preview = $previewHtml;
            cb();
        },
        {
            orientation: self.orientation,
            maxWidth: 300,
            maxHeight: 500,
            canvas: true
        }
    );
};
Uploader.prototype.uploadImage = function (cb){
    var self = this;
    var xhr = new XMLHttpRequest();
    var fd = new FormData();
    xhr.open('POST', self.uploadUrl, true);
    xhr.upload.onprogress = function(event){
        var percent = Math.ceil((event.loaded / event.total) * 100);
        self.$preview.find('.bar').css({width: percent + '%'}).attr('data-percent', percent);
    };
    xhr.onreadystatechange = function(){
        if(xhr.readyState === 4 && xhr.status === 200){
            self.uploadResponse = JSON.parse(xhr.response);
            self.$preview.find('.image')
                .attr('data-hash', self.uploadResponse.hash)
                .attr('data-key', self.uploadResponse.key);
            var $img = '<img src="//cdn.lazycoffee.com/' + self.uploadResponse.key + '_w1024" alt="' + self.file.name + '">';
            self.$preview.find('canvas').replaceWith($img);
            self.$preview.find('.progress').removeClass('active yellow').addClass('blue');
            cb();
        }
    };
    fd.append('token', self.upToken);
    fd.append('file', self.file);
    xhr.send(fd);
};
Uploader.prototype.getUpToken = function (cb){
    var self = this;
    $.get(self.getUpTokenUrl, function(data, status){
        if(status === 'success'){
            self.upToken = data.uptoken;
            cb();
        }else{
            console.error('获取上传Token时发生网络错误。');
        }
    });
};
Uploader.prototype.saveImageInDatabase = function (){
    var self = this;
    var response = self.uploadResponse;
    var postData = {};
    postData.hash = response.hash;
    postData.key = response.key;
    postData.galleryId = $('#gallery-id').data('galleryId');
    postData.fileName = self.file.name;
    postData.date = self.exif.DateTime;
    $.post('/image/save', postData, function (data, status) {
        console.log(data);
        if(status === 'success'){
            if(data.state === 5) {
                self.$preview.find('.content>span').text('重复上传（已删除）');
                self.$preview.find('.progress').removeClass('blue yellow');
            }else if([2, 4].indexOf(data.state) === -1){
                window.alertModal('抱歉，服务器发生错误，保存不了你的图片...');
            }else {
                self.$preview.find('.progress').removeClass('yellow').addClass('success');
            }
        }else{
            console.error('Sorry,保存相册到数据库的时候出现网络错误了...');
        }
    });
};
Uploader.prototype.removeItem = function (hash, galleryId, cb){
    var self = this;
    var callback = cb || function (){};
    self.getUpToken(function () {
        $.post(self.removeUrl, {hash: hash, galleryId: galleryId}, function (data, status) {
            console.log(data);
            if(status === 'success'){
                callback(data);
            }else{
                console.error('删除照片时发生网络错误，这种情况一般源于网络传输故障，与本站无关，请与你的电信服务商联系。');
            }
        });
    });
};
