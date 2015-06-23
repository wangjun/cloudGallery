'use strict';
var express = require('express');
var router = express.Router();

router.get('/:userName/:galleryName', function (req, res, next) {
    var userName = req.params.userName;
    var galleryName = req.params.galleryName;
});


module.exports = router;