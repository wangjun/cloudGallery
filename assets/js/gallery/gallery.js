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
                var imageUploader = new uploader(file,$images);
                imageUploader.upload();
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