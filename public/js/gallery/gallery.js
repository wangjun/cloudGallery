"use strict";$(document).ready(function(){var a=$("#upload-button"),b=$("#upload-input"),c=$("#images"),d=$("#remove-image-button"),e=$("#show-image-modal"),f=$("#gallery-id"),g=f.data("galleryId"),h={};a.on("click",function(a){a.preventDefault(),b.trigger("click")}),b.on("change",function(){for(var a=this.files,b=0;b<a.length;b++){var d=a[b],e=new Uploader(d,c);e.upload()}}),$(document).on("click",".card",function(a){a.preventDefault(),$(this).hasClass("uploading")?window.alertModal("上传中，请耐心等待..."):(e.modal("show"),$(".main-gallery").flickity({cellAlign:"left",contain:!0,freeScroll:!0,pageDots:!1}))}),$(document).on("click","[data-action=deleteItem]",function(a){a.preventDefault();var b=[1,2,4,5,7],c=new Uploader;d.addClass("loading disabled"),c.removeItem(h.key,g,function(a){-1===b.indexOf(a.state)?d.html("删除失败").addClass("disabled"):(d.html("删除成功").removeClass("disabled"),e.modal("hide"),window.$imagesLayout.masonry("remove",$(".card[data-hash="+h.hash+"]")).masonry("layout"))})}),$("#hide-image-modal").on("click",function(a){a.preventDefault(),e.modal("hide")}),e.modal({onHidden:function(){d.removeClass("loading disabled"),d.html("删除")}}),$("#weibo-share-btn").on("click",function(a){a.preventDefault(),$.post("/society/weibo/share",{content:"testing"},function(a,b){"success"===b&&(4===a.state&&window.alertModal("你尚未登录。"),console.log(a))})}),window.$imagesLayout=c.masonry({itemSelector:".card",percentPosition:!0}),window.$imagesLayout.imagesLoaded().progress(function(){window.$imagesLayout.masonry("layout")})});