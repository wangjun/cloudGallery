'use strict';
var express = require('express');
var router = express.Router();
var weibo = require('../../lib/society/sinaWeibo');
/* share gallery */
router.post('/share-gallery', function (req, res, next) {
    var userId = req.session.user._id;
    var content = req.body.content;
    weibo.postAWeiboByUserId(userId, content, function (resWeibo) {
        console.log(resWeibo);
    });
});
module.exports = router;
