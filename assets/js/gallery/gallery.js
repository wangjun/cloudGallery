$(document).ready(function(){
    //init dom
    var $uploadButton = $('#upload-button');
    var $uploadBox = $('#upload-box');
    var $uploadInput = $('#upload-input');
    var $addImages = $('#add-images');

    //trigger input click event
    $uploadBox.on('click', function () {
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
            console.log(file);
            loadImage(
                file,
                function(img){
                    var $previewHtml = $('<div/>');
                    $previewHtml.addClass('col-xs-6 col-sm-3');
                    $previewHtml.append('<a/>');
                    var $a =$previewHtml.find('a');
                    $a.addClass('thumbnail');
                    $a.append(img);
                    $addImages.after($previewHtml);
                },
                {
                    maxWidth:'100%',
                    orientation:true,
                    canvas:true
                }
            )
        }
    });
    //function handleFiles(files) {
    //    for (var i = 0; i < files.length; i++) {
    //        var file = files[i];
    //        console.log(file);
    //        var imageType = /image.*/;
    //        if (!file.type.match(imageType)) {
    //            continue;
    //        }
    //        var reader = new FileReader();
    //        reader.onload = function(event){
    //            var imgData64 = event.target.result;
    //            var $preViewHtml = '<div class="col-xs-6 col-sm-3">' +
    //                '<a href="#" class="thumbnail">' +
    //                '<img src="'+imgData64+'" />' +
    //                '</a>' +
    //                '</div>';
    //            $($addImages).after($preViewHtml);
    //        };
    //        reader.readAsDataURL(file);
    //    }
    //}
});