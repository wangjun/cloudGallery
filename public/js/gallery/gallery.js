"use strict";$(document).ready(function(){var a=$("#upload-button"),b=$("#upload-box"),c=$("#upload-input"),d=$("#images"),e=$("#lovely-link"),f=$("#lovely-link-modal"),g=$("#remove-image-button"),h=$("#show-image-modal");!function(){b.on("click",function(a){a.preventDefault(),c.trigger("click")}),a.on("click",function(a){a.preventDefault(),c.trigger("click")}),c.on("change",function(){for(var a=this.files,b=0;b<a.length;b++){var c=a[b],e=new Uploader(c,d);e.upload()}})}(),e.on("click",function(a){a.preventDefault(),f.modal("show")}),$(document).on("click","[data-action=deleteItem]",function(a){a.preventDefault();var b=$(this).attr("data-hash"),c=[2,4,6,7],d=new Uploader;g.html('<span class="glyphicon glyphicon-refresh spin" aria-hidden="true"></span>'),d.removeItem(b,function(a){-1===c.indexOf(a.state)?g.html("删除失败").prop("disable",!0):(g.html("删除成功").prop("disable",!0),h.modal("hide"),$("[data-hash="+b+"]").closest(".image").fadeOut(function(){$(this).remove()}))})}),h.on("hide.bs.modal",function(){g.text("删除").prop("disable",!1)}),$(document).on("click",".thumbnail",function(a){a.preventDefault();var b=$(this).find("img"),c="//cdn.lazycoffee.com/"+$(this).attr("data-key")+"-auto",d=b.attr("alt"),e=$(this).attr("data-hash"),f=$(this).attr("data-name");h.find("img").attr({src:c,alt:d}),h.find("[data-hash]").attr("data-hash",e),h.find(".modal-title").text(f),h.modal("show")})});