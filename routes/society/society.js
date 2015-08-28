'use strict';
var express = require('express');
var router = express.Router();
var sinaWeibo = require('./sinaWeibo');
router.use('/weibo', sinaWeibo);
module.exports = router;
