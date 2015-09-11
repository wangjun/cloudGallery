"use strict";lcApp.controller("galleryCtr",["$scope","$http",function(a,b){var c=$("#upload-input"),d=$("#images"),e=$("#remove-image-button"),f=$("#show-image-modal"),g=$(".main-gallery"),h=$(".image-file-name");a.images=[],a.duplicateImages=[],a.currentImageIndex=0;var i=d.packery({itemSelector:".card"});i.imagesLoaded().progress(function(){i.packery("layout")}),g.flickity({cellSelector:".gallery-cell",pageDots:!1,percentPosition:!1,imagesLoaded:!0,setGallerySize:!1,lazyLoad:2});var j=function(a,b){this.file=a||null,this.$dom=b||null,this.removeUrl="/gallery/remove-image",this.getUpTokenUrl="/cdn/uptoken",this.uploadUrl="http://upload.qiniu.com"};j.prototype.upload=function(){var a=this;a.getOrientation(function(){a.showImage(function(){a.getUpToken(function(){a.uploadImage(function(){a.saveImageInDatabase()})})})})},j.prototype.getOrientation=function(a){var b=this;loadImage.parseMetaData(b.file,function(c){var d=c.exif.getAll(),e=c.exif.get("Orientation");e?(b.orientation=e,b.exif=d,a()):console.log("this is not a photo.")})},j.prototype.showImage=function(b){var c=this;loadImage(c.file,function(d){$("#no-image-gallery").remove();var e=moment(c.exif.DateTime,"YYYY:MM:DD HH:mm:ss").format("LL"),f=$("<div/>");f.addClass("card uploading").append('<div class="image"></div>').append('<div class="content"><div class="meta"><span class="date">'+e+"</span></div></div>").append('<div class="ui bottom attached progress active" data-percent="1"><div class="bar" style="width:1px;"></div></div>'),f.find(".image").append(d),i.prepend(f).packery("prepended",f),c.$preview=f,a.images.unshift({fileName:c.file.name}),b()},{orientation:c.orientation,maxWidth:260,maxHeight:400,canvas:!0}),loadImage(c.file,function(a){var b=$("<div/>");b.addClass("gallery-cell uploading"),b.attr("data-name",c.file.name),b.append(a),g.flickity("prepend",b)},{orientation:c.orientation,maxWidth:850,maxHeight:600,canvas:!0})},j.prototype.uploadImage=function(a){var b=this,c=new XMLHttpRequest,d=new FormData;c.open("POST",b.uploadUrl,!0),c.upload.onprogress=function(a){var c=Math.ceil(a.loaded/a.total*100);b.$preview.find(".bar").css({width:c+"%"}).parent().attr("data-percent",c)},c.onreadystatechange=function(){4===c.readyState&&200===c.status&&(b.uploadResponse=JSON.parse(c.response),b.$preview.attr("data-hash",b.uploadResponse.hash).attr("id","image-"+b.uploadResponse.hash).attr("data-name",b.file.name),b.$preview.find(".progress").removeClass("active").addClass("blue"),a())},d.append("token",b.upToken),d.append("file",b.file),c.send(d)},j.prototype.getUpToken=function(a){var b=this;$.get(b.getUpTokenUrl,function(c,d){"success"===d?(b.upToken=c.uptoken,a()):console.error("获取上传Token时发生网络错误。")})},j.prototype.removeUploadingItem=function(){var b=this;i.packery("remove",b.$preview).packery("layout"),g.flickity("remove",g.find('[data-name="'+b.file.name+'"]'));for(var c=0;c<a.images.length;c++)a.images[c].fileName===b.file.name&&(a.images[c].hash||a.images.splice(c,1))},j.prototype.saveImageInDatabase=function(){var c=this,d={};d.hash=c.uploadResponse.hash,d.key=c.uploadResponse.key,d.galleryId=a.galleryId,d.fileName=c.file.name,d.date=c.exif.DateTime,b.post("/image/save",d).then(function(b){console.log(b);var d=b.data;if("OK"===b.statusText){if(5===d.state)a.duplicateImages.push(c.file.name),c.removeUploadingItem();else if(-1===[2,4].indexOf(d.state))window.alertModal("抱歉，服务器发生错误，保存不了你的图片..."),c.removeUploadingItem();else{c.$preview.find(".progress").addClass("success"),console.log(a.images);for(var e=0;e<a.images.length;e++)a.images[e].fileName===c.file.name&&(a.images[e].hash||(a.images[e].hash=c.uploadResponse.hash,a.images[e].key=c.uploadResponse.key));g.find('[data-name="'+c.file.name+'"]').removeClass("uploading").attr("id","flickity-"+c.uploadResponse.hash)}c.$preview.removeClass("uploading")}else console.error("Sorry,保存相册到数据库的时候出现网络错误了..."),i.packery("remove",c.$preview).packery("layout")})},j.prototype.removeItem=function(a,c,d){var e=this,f=d||function(){};a&&c?e.getUpToken(function(){b.post(e.removeUrl,{hash:a,galleryId:c}).then(function(a){var b=a.data;console.log(b),"OK"===a.statusText?f(b):console.error("删除照片时发生网络错误，这种情况一般源于网络传输故障，与本站无关，请与你的网络服务商联系。")})}):console.log("error:hash"+a+";gallery:"+c)},d.on("click",".card",function(){var b=$(this).attr("data-hash"),c=[];a.images.forEach(function(a){a.hash?c.push(a.hash):c.push(null)});var d=c.indexOf(b);a.currentImageIndex=d,g.flickity("select",d),$(this).hasClass("uploading")?window.alertModal("上传中，请耐心等待..."):f.modal({onVisible:function(){g.flickity("resize")}}).modal("show"),a.$apply()}),a.initImages=function(b){a.images.push(b)},a.selectFiles=function(){c.trigger("click"),a.duplicateImages=[]},e.on("click",function(){var b=a.currentImageIndex;if(-1===b)return!1;e.addClass("loading disabled");var c=[1,2,4,5,7],d=new j;d.removeItem(a.images[b].hash,a.galleryId,function(d){-1===c.indexOf(d.state)?e.popup({content:"删除失败",on:"focus"}).popup("show"):(i.packery("remove",$("#image-"+a.images[b].hash)).packery("layout"),g.flickity("remove",$("#flickity-"+a.images[b].hash)),a.images.splice(b,1),e.popup("destroy")),e.removeClass("loading disabled")})}),g.on("cellSelect",function(){var b=$(this).data("flickity");a.currentImageIndex=b.selectedIndex,h.text(a.images[b.selectedIndex].fileName),g.find('[data-name="'+a.images[b.selectedIndex].fileName+'"]').hasClass("uploading")?e.addClass("disabled"):e.removeClass("disabled"),console.log(b.selectedIndex)}),c.on("change",function(){for(var a=this.files,b=0;b<a.length;b++){var c=a[b],e=new j(c,d);e.upload()}}),f.modal({onHidden:function(){e.removeClass("loading disabled"),e.html("删除")}}),$("#weibo-share-btn").on("click",function(a){a.preventDefault(),$.post("/society/weibo/share",{content:"testing"},function(a,b){"success"===b&&(4===a.state&&window.alertModal("你尚未登录。"),console.log(a))})})}]);