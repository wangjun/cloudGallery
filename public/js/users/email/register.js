"use strict";$(document).ready(function(){var a=$("#email-register-next-btn"),b=$("#email-register-input"),c=function(){var c=b.val();a.html('<div class="ui active mini inline loader"></div>').prop("disabled",!0),$.post("/users/email/register",{email:c},function(a,b){console.log(a),"success"===b?2===a.state?window.location.href="/users/email/sent":3===a.state&&window.location.reload(!0):console.log("网络错误")})};a.on("click",function(a){a.preventDefault(),c()});var d=!1;b.on("input",function(e){if("13"===e.keyCode)c();else{var f=b.val(),g=validator.isEmail(f);g?(a.prop("disabled",!1),d=!1,b.popup("destroy")):(a.prop("disabled",!0),d===!1&&b.popup({content:"邮箱格式不正确",trigger:"manual",onShow:function(){d=!0}}).popup("show"))}})});