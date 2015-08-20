"use strict";var Uploader=function(a,b){this.file=a||null,this.$dom=b||null,this.removeUrl="/gallery/remove-image",this.getUpTokenUrl="/cdn/uptoken",this.uploadUrl="http://upload.qiniu.com"};Uploader.prototype.upload=function(){var a=this;a.getOrientation(function(){a.showImage(function(){a.getUpToken(function(){a.uploadImage(function(){a.saveImageInDatabase()})})})})},Uploader.prototype.getOrientation=function(a){var b=this;loadImage.parseMetaData(b.file,function(c){var d=c.exif.getAll(),e=c.exif.get("Orientation");e?(b.orientation=e,b.exif=d,a()):console.log("this is not a photo.")})},Uploader.prototype.showImage=function(a){var b=this;loadImage(this.file,function(c){$("#no-image-gallery").remove();var d=moment(b.exif.DateTime,"YYYY:MM:DD HH:mm:ss").format("LL"),e=$("<div/>");e.addClass("card").append('<div class="image"></div>').append('<div class="content"><span class="header">'+b.file.name+'</span><div class="meta"><span class="date">摄于'+d+"</span></div></div>").append('<div class="ui bottom attached progress active yellow" data-percent="0"><div class="bar" style="width:0;"></div></div>'),e.find(".image").append(c),b.$dom.append(e),b.$preview=e,a()},{orientation:b.orientation,maxWidth:300,maxHeight:500,canvas:!0})},Uploader.prototype.uploadImage=function(a){var b=this,c=new XMLHttpRequest,d=new FormData;c.open("POST",b.uploadUrl,!0),c.upload.onprogress=function(a){var c=Math.ceil(a.loaded/a.total*100);b.$preview.find(".bar").css({width:c+"%"}).attr("data-percent",c)},c.onreadystatechange=function(){if(4===c.readyState&&200===c.status){b.uploadResponse=JSON.parse(c.response),b.$preview.find(".image").attr("data-hash",b.uploadResponse.hash).attr("data-key",b.uploadResponse.key);var d='<img src="//cdn.lazycoffee.com/'+b.uploadResponse.key+'_w1024" alt="'+b.file.name+'">';b.$preview.find("canvas").replaceWith(d),b.$preview.find(".progress").removeClass("active yellow").addClass("blue"),a()}},d.append("token",b.upToken),d.append("file",b.file),c.send(d)},Uploader.prototype.getUpToken=function(a){var b=this;$.get(b.getUpTokenUrl,function(c,d){"success"===d?(b.upToken=c.uptoken,a()):console.error("获取上传Token时发生网络错误。")})},Uploader.prototype.saveImageInDatabase=function(){var a=this,b=a.uploadResponse,c={};c.hash=b.hash,c.key=b.key,c.galleryId=$("#gallery-id").data("galleryId"),c.fileName=a.file.name,c.date=a.exif.DateTime,$.post("/image/save",c,function(b,c){console.log(b),"success"===c?5===b.state?(a.$preview.find(".content>span").text("重复上传（已删除）"),a.$preview.find(".progress").removeClass("blue yellow")):-1===[2,4].indexOf(b.state)?window.alertModal("抱歉，服务器发生错误，保存不了你的图片..."):a.$preview.find(".progress").removeClass("yellow").addClass("success"):console.error("Sorry,保存相册到数据库的时候出现网络错误了...")})},Uploader.prototype.removeItem=function(a,b,c){var d=this,e=c||function(){};d.getUpToken(function(){$.post(d.removeUrl,{hash:a,galleryId:b},function(a,b){console.log(a),"success"===b?e(a):console.error("删除照片时发生网络错误，这种情况一般源于网络传输故障，与本站无关，请与你的电信服务商联系。")})})};