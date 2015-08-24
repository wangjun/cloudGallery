'use strict';
var express = require('express');
var router = express.Router();
router.use('/', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
router.post('/weibo/register', function (req, res) {
    res.json({content: 'you passed'});
});

module .exports = router;