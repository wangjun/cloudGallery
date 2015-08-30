'use strict';
var express = require('express');
var router = express.Router();
var libWeibo = require('../../lib/society/sinaWeibo');
router.post('/share', function (req, res, next) {
    var content = req.body.content;
    if(req.session.user){
        var userId = req.session.user._id;
        libWeibo.postAWeiboByUserId(userId, content, function (err, resWeibo) {
            if(err){
                res.json(err);
            }
            if(resWeibo){
                res.json({
                    weibo: resWeibo
                });
            }
        });
    }else{
        res.json({
            state: 4,
            msg: 'You have not login.'
        });
    }
});
module.exports = router;
