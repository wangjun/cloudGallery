'use strict';
/* global lcApp loadImage moment */
lcApp.controller('galleryCtr', ['$scope', '$http', function ($scope, $http) {
    //init dom
    var $uploadInput = $('#upload-input');
    var $images = $('#images');
    var $removeImageButton = $('#remove-image-button');
    var $showImageModal = $('#show-image-modal');
    var $mainGallery = $('.main-gallery');
    var $imageFileName = $('.image-file-name');
    //init variables
    var cdnPrefix = 'http://cdn.lazycoffee.com';
    $scope.images = [];
    $scope.duplicateImages = [];
    $scope.currentImageIndex = 0;
    // init packery
    var $imagesLayout = $images.packery({
        itemSelector: '.card'
    });
    // layout packery after each image loads
    $imagesLayout.imagesLoaded().progress(function () {
        $imagesLayout.packery('layout');
    });
    //flickity init
    $mainGallery.flickity({
        // options
        cellSelector: '.gallery-cell',
        pageDots: false,
        percentPosition: false,
        imagesLoaded: true,
        setGallerySize: false,
        lazyLoad: 2
    });
    //uploader
    var Uploader = function (file, $domArg) {
        this.file = file || null;
        this.$dom = $domArg || null;
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
        //parse exif
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
        //load image for preview
        loadImage(
            self.file,
            function(img){
                $('#no-image-gallery').remove();
                var date = moment(self.exif.DateTime, 'YYYY:MM:DD HH:mm:ss').format('LL');
                var $previewHtml = $('<div/>');
                $previewHtml.addClass('card uploading')
                    .append('<div class="image"></div>')
                    .append('<div class="content">' +
                    //'<span class="header">' + self.file.name + '</span>' +
                    '<div class="meta">' +
                    '<span class="date">' + date + '</span>' +
                    '</div>' +
                    '</div>')
                    .append('<div class="ui bottom attached progress active" data-percent="1">' +
                    '<div class="bar" style="width:1px;"></div>' +
                    '</div>');
                $previewHtml.find('.image').append(img);
                $imagesLayout.prepend( $previewHtml ).packery('prepended', $previewHtml);
                self.$preview = $previewHtml;
                //add image file name
                $scope.images.unshift({fileName: self.file.name});
                cb();
            }, {
                orientation: self.orientation,
                maxWidth: 260,
                maxHeight: 400,
                canvas: true
            }
        );
        //load image for flickity
        loadImage(
            self.file,
            function (img) {
                var $newFlickity = $('<div/>');
                $newFlickity.addClass('gallery-cell uploading');
                $newFlickity.attr('data-name', self.file.name);
                $newFlickity.append(img);
                $mainGallery.flickity('prepend', $newFlickity);
            }, {
                orientation: self.orientation,
                maxWidth: 850,
                maxHeight: 600,
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
            self.$preview.find('.bar').css({width: percent + '%'}).parent().attr('data-percent', percent);
        };
        xhr.onreadystatechange = function(){
            if(xhr.readyState === 4 && xhr.status === 200){
                self.uploadResponse = JSON.parse(xhr.response);
                self.$preview
                    .attr('data-hash', self.uploadResponse.hash)
                    .attr('id', 'image-' + self.uploadResponse.hash)
                    .attr('data-name', self.file.name);
                self.$preview.find('.progress').removeClass('active').addClass('blue');
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
    Uploader.prototype.removeUploadingItem = function () {
        var self = this;
        $imagesLayout.packery('remove', self.$preview).packery('layout');
        $mainGallery.flickity('remove', $mainGallery.find('[data-name="' + self.file.name + '"]'));
        for(var j = 0; j < $scope.images.length; j++){
            if($scope.images[j].fileName === self.file.name){
                if(!$scope.images[j].hash){
                    $scope.images.splice(j, 1);
                }
            }
        }
    };
    Uploader.prototype.saveImageInDatabase = function (){
        var self = this;
        var postData = {};
        postData.hash = self.uploadResponse.hash;
        postData.key = self.uploadResponse.key;
        postData.galleryId = $scope.galleryId;
        postData.fileName = self.file.name;
        postData.date = self.exif.DateTime;
        $http.post('/image/save', postData).then(function (res) {
            console.log(res);
            var data = res.data;
            if(res.statusText === 'OK'){
                if(data.state === 5) {
                    $scope.duplicateImages.push(self.file.name);
                    self.removeUploadingItem();
                }else if([2, 4].indexOf(data.state) === -1){
                    window.alertModal('抱歉，服务器发生错误，保存不了你的图片...');
                    self.removeUploadingItem();
                }else {
                    self.$preview.find('.progress').addClass('success');
                    console.log($scope.images);
                    for(var i = 0; i < $scope.images.length; i++){
                        if($scope.images[i].fileName === self.file.name){
                            if(!$scope.images[i].hash){
                                $scope.images[i].hash = self.uploadResponse.hash;
                                $scope.images[i].key = self.uploadResponse.key;
                            }
                        }
                    }
                    //remove flickity uploading class
                    $mainGallery
                        .find('[data-name="' + self.file.name + '"]')
                        .removeClass('uploading')
                        .attr('id', 'flickity-' + self.uploadResponse.hash);
                }
                self.$preview.removeClass('uploading');
            }else{
                console.error('Sorry,保存相册到数据库的时候出现网络错误了...');
                $imagesLayout.packery('remove', self.$preview).packery('layout');
            }
        });
    };
    Uploader.prototype.removeItem = function (hash, id, cb){
        var self = this;
        var callback = cb || function (){};
        if(hash && id){
            self.getUpToken(function () {
                $http.post(self.removeUrl, {hash: hash, galleryId: id}).then(function (res) {
                    var data = res.data;
                    console.log(data);
                    if(res.statusText === 'OK'){
                        callback(data);
                    }else{
                        console.error('删除照片时发生网络错误，这种情况一般源于网络传输故障，与本站无关，请与你的网络服务商联系。');
                    }
                });
            });
        }else{
            console.log('error:hash' + hash + ';gallery:' + id);
        }
    };
    //show image
    $images.on('click', '.card', function () {
        var imageHash = $(this).attr('data-hash');
        var allImagesHash = [];
        $scope.images.forEach(function (eachImage) {
            if(eachImage.hash){
                allImagesHash.push(eachImage.hash);
            }else{
                allImagesHash.push(null);
            }
        });
        var index = allImagesHash.indexOf(imageHash);
        $scope.currentImageIndex = index;
        $mainGallery.flickity('select', index);
        //show image
        if ($(this).hasClass('uploading')) {
            window.alertModal('上传中，请耐心等待...');
        } else {
            $showImageModal.modal({
                onVisible: function () {
                    $mainGallery.flickity('resize');
                }
            }).modal('show');
        }
        $scope.$apply();
    });
    //init images
    $scope.initImages = function (image) {
        $scope.images.push(image);
    };
    //open files selection dialog
    $scope.selectFiles = function () {
        $uploadInput.trigger('click');
        $scope.duplicateImages = [];
    };
    //remove image
    $removeImageButton.on('click', function(){
        var index = $scope.currentImageIndex;
        if(index !== -1){
            $removeImageButton.addClass('loading disabled');
            var successStatus = [1, 2, 4, 5, 7];
            var uploader = new Uploader();
            uploader.removeItem($scope.images[index].hash, $scope.galleryId, function (data) {
                if (successStatus.indexOf(data.state) === -1) {
                    $removeImageButton.popup({content: '删除失败', on: 'focus'}).popup('show');
                } else {
                    //reLayout packery
                    $imagesLayout.packery('remove', $('#image-' + $scope.images[index].hash)).packery('layout');
                    //remove flickity image
                    $mainGallery.flickity('remove', $('#flickity-' + $scope.images[index].hash));
                    //remove value
                    $scope.images.splice(index, 1);
                    $removeImageButton.popup('destroy');
                }
                $removeImageButton.removeClass('loading disabled');
            });
        }else{
            return false;
        }
    });
    //flickity select event
    $mainGallery.on( 'cellSelect', function() {
        var flickity = $(this).data('flickity');
        //change the current image value
        $scope.currentImageIndex = flickity.selectedIndex;
        //change file name
        $imageFileName.text($scope.images[flickity.selectedIndex].fileName);
        if($mainGallery.find('[data-name="' + $scope.images[flickity.selectedIndex].fileName + '"]').hasClass('uploading')){
            $removeImageButton.addClass('disabled');
        }else{
            $removeImageButton.removeClass('disabled');
        }
        console.log(flickity.selectedIndex);
    });
    $uploadInput.on('change', function () {
        var files = this.files;
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var imageUploader = new Uploader(file, $images);
            imageUploader.upload();
        }
    });
    $showImageModal.modal({
        onHidden: function () {
            $removeImageButton.removeClass('loading disabled');
            $removeImageButton.html('删除');
        }
    });
    $('#weibo-share-btn').on('click', function (event) {
        event.preventDefault();
        $.post('/society/weibo/share', {
            content: 'testing'
        }, function (data, status) {
            if(status === 'success'){
                if(data.state === 4){
                    window.alertModal('你尚未登录。');
                }
                console.log(data);
            }
        });
    });
}]);
