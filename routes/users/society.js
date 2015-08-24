'use strict';
var express = require('express');
var router = express.Router();

router.post('/weibo/register', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "https://api.weibo.com");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
});

module .exports = router;