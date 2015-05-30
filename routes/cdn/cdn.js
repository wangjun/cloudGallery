'use strict';
var express = require('express');
var router = express.Router();
var qiniu = require('qiniu');

qiniu.conf.ACCESS_KEY = 'kJhScafDxwS76FQZ4RNORIpRLsPFaa-1mNmoxo8X';
qiniu.conf.SECRET_KEY = 'GPsOPek--mTpl5qREbmXUeEk_CDzMzUrGM-Bdqdz';

router.get('/uptoken', function (req, res) {
    var uptoken = function uptoken() {
        var putPolicy = new qiniu.rs.PutPolicy('lazycoffee');
        //putPolicy.callbackUrl = callbackUrl;
        //putPolicy.callbackBody = callbackBody;
        //putPolicy.returnUrl = returnUrl;
        //putPolicy.returnBody = returnBody;
        //putPolicy.asyncOps = asyncOps;
        //putPolicy.expires = expires;
        return putPolicy.token();
    };
    res.header("Cache-Control", "max-age=0, private, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", 0);
    res.json({
        uptoken:uptoken()
    });
});


module.exports = router;