'use strict';
$(document).ready(function () {
    var result = document.getElementById("pre-upload");
    var input = document.getElementById("file-input");

    var uploader = Qiniu.uploader({
        runtimes: 'html5,flash,html4',    //上传模式,依次退化
        browse_button: 'drop-area',       //上传选择的点选按钮，**必需**
        uptoken_url: '/cdn/uptoken',
        //Ajax请求upToken的Url，**强烈建议设置**（服务端提供）
        // uptoken : '<Your upload token>',
        //若未指定uptoken_url,则必须指定 uptoken ,uptoken由其他程序生成
        unique_names: true,
        // 默认 false，key为文件名。若开启该选项，SDK会为每个文件自动生成key（文件名）
        // save_key: true,
        // 默认 false。若在服务端生成uptoken的上传策略中指定了 `sava_key`，则开启，SDK在前端将不对key进行任何处理
        domain: 'http://cdn.lazycoffee.com/',
        //bucket 域名，下载资源时用到，**必需**
        container: 'uploader',           //上传区域DOM ID，默认是browser_button的父元素，
        max_file_size: '10mb',           //最大文件体积限制
        flash_swf_url: 'js/plupload/Moxie.swf',  //引入flash,相对路径
        max_retries: 3,                   //上传失败最大重试次数
        dragdrop: true,                   //开启可拖曳上传
        drop_element: 'drop-area',        //拖曳上传区域元素的ID，拖曳文件或文件夹后可触发上传
        chunk_size: '4mb',                //分块上传时，每片的体积
        auto_start: true,                 //选择文件后自动上传，若关闭需要自己绑定事件触发上传
        init: {
            'FilesAdded': function(up, files) {
                plupload.each(files, function(file) {
                    // 文件添加进队列后,处理相关的事情
                });
            },
            'BeforeUpload': function(up, file) {
                // 每个文件上传前,处理相关的事情
                var $target = $('#'+up.getOption('container'));
                var progress = new FileProgress(file, $target);
                var chunk_size = plupload.parseSize(up.getOption('chunk_size'));
                if (up.runtime === 'html5' && chunk_size) {
                    progress.setStatus('排队ing...');
                }
            },
            'UploadProgress': function(up, file) {
                // 每个文件上传时,处理相s关的事情
                //console.log('uploadProgress');
                //var chunk_size = plupload.parseSize(this.getOption('chunk_size'));
                //console.log(chunk_size);
                //console.log(up);
                //console.log(file.percent);
                var $target = $('#'+up.getOption('container'));
                var progress = new FileProgress(file, $target);
                progress.setProgress(file.percent);
            },
            'FileUploaded': function(up, file, info) {
                // 每个文件上传成功后,处理相关的事情
                // 其中 info 是文件上传成功后，服务端返回的json，形式如
                // {
                //    "hash": "Fh8xVqod2MQ1mocfI4S4KpRL6D98",
                //    "key": "gogopher.jpg"
                //  }
                // 参考http://developer.qiniu.com/docs/v6/api/overview/up/response/simple-response.html
                // var domain = up.getOption('domain');
                // var res = parseJSON(info);
                // var sourceLink = domain + res.key; 获取上传成功后的文件的Url
                var progress = new FileProgress(file);
                progress.addImage(up, info);
            },
            'Error': function(up, err, errTip) {
                //上传出错时,处理相关的事情
                console.log('error');
                console.log(up);
                console.log(err);
                console.log(errTip);
            },
            'UploadComplete': function() {
                //队列文件处理完毕后,处理相关的事情
            },
            'Key': function(up, file) {
                // 若想在前端对每个文件的key进行个性化处理，可以配置该函数
                // 该配置必须要在 unique_names: false , save_key: false 时才生效
                var key = "";
                // do something with key here
                return key
            }
        }
    });
// domain 为七牛空间（bucket)对应的域名，选择某个空间后，可通过"空间设置->基本设置->域名设置"查看获取
// uploader 为一个plupload对象，继承了所有plupload的方法，参考http://plupload.com/docs
    //自定义函数
    function FileProgress(file,$target){
        this.file = file;
        var id = file.id;
        var $progressBar = $('#'+id);
        if($progressBar.length==0){
            $progressBar = $('<div/>');
            $progressBar
                .addClass('col-xs-3')
                .attr('id', id)
                .css({'display':'none'})
                .html(
                '<a href="#" class="thumbnail">' +
                '<div class="progress">' +
                '<div class="progress-bar progress-bar-success progress-bar-striped active" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="min-width:3em">' +
                '0%' +
                '</div>' +
                '</div>' +
                '</a>'
            );
            $target.after($progressBar);
        }else {
            $progressBar.slideDown();
        }
        this.$progressBar = $progressBar;
    }
    FileProgress.prototype.setStatus = function (statusText){
        var $progressBar = this.$progressBar;
        $progressBar.find('.progress-bar').text(statusText);
    };
    FileProgress.prototype.setProgress = function (progressPercent) {
        var $progressBar = this.$progressBar;
        $progressBar
            .find('.progress-bar')
            .text(progressPercent+'%')
            .stop(true,true)
            .animate({'width':progressPercent+'%'})
            .attr('aria-valuenow',progressPercent);
    };
    FileProgress.prototype.addImage = function (up,info) {
        var $progressBar = this.$progressBar;
        var domain = up.getOption('domain');
        var res = JSON.parse(info);
        var sourceLink = domain + res.key;
        var imgHtml = '<a href="#" class="thumbnail">' +
            '<img src="'+sourceLink+'-auto" alt="'+res.key+'" />' +
            '</a>';
        $progressBar.html(imgHtml);
    }
});