'use strict';
var express = require('express');
var router = express.Router();
var libWeibo = require('../../lib/society/sinaWeibo');
router.post('/share', function (req, res, next) {
    var content = req.body.content;
    var userId = req.session.user._id;
    console.log(req.session.user);
    libWeibo.postAWeiboByUserId(userId, content, function (err, resWeibo) {
        if(err){return next(err); }
        if(resWeibo){
            console.log(resWeibo);
        }
    });
});
module.exports = router;
