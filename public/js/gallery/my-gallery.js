$(document).ready(function(){"use strict";var a=$(".other-features-btn"),b=$("#removeGalleryModal"),c=$("#otherFeaturesModal"),d=$(".remove-gallery-btn"),e=$("#remove-gallery-confirmed"),f=0;a.on("touchstart click",function(){f=$(this).data("gallery"),c.modal("show")}),d.on("touchstart click",function(){b.modal("show")}),e.on("touchstart click",function(a){if(a.preventDefault(),$(this).hasClass("disabled"))window.alertModal("删除中，请稍等...");else{$(this).html();$(this).addClass("disabled loading"),$.post("/gallery/remove",{galleryId:f},function(a,c){"success"===c?3===a.state?$("#"+f).slideUp(function(){$(this).remove()}):window.alertModal("删除失败！"):window.alertModal("网络错误，删除失败。"),$(this).removeClass("disabled loading"),b.modal("hide")})}})});