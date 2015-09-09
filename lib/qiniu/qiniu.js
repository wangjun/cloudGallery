'use strict';
var config = require('../admin/config');
var qiniu = require('qiniu');
var Qiniu = {};
Qiniu.genUptoken = function (bucket) {
    qiniu.conf.ACCESS_KEY = config.cdn.qiniu.AccessKey;
    qiniu.conf.SECRET_KEY = config.cdn.qiniu.SecretKey;
    var putPolicy = new qiniu.rs.PutPolicy(bucket);
    //putPolicy.callbackUrl = callbackUrl;
    //putPolicy.callbackBody = callbackBody;
    //putPolicy.returnUrl = returnUrl;
    //putPolicy.returnBody = returnBody;
    //putPolicy.asyncOps = asyncOps;
    //putPolicy.expires = expires;
    return putPolicy.token();
};
module.exports = Qiniu;