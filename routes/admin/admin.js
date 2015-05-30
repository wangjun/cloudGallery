'use strict';
var express = require('express');
var router = express.Router();
var Users = require('../../model/users');
var usersManager = require('./users');

//administrator index
router.get('/', function (req, res) {
    res.render('admin/admin.html');
});

//user manger
router.use('/users', usersManager);

module.exports = router;