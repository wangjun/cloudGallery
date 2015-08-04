'use strict';
var express = require('express');
var router = express.Router();
var usersManager = require('./users');
var log = require('./log');
var test = require('./test');

//administrator index
router.get('/', function (req, res) {
    res.render('admin/admin.html');
});

//user manger
router.use('/users', usersManager);
router.use('/log', log);
router.use('/test', test);

module.exports = router;
