'use strict';
var express = require('express');
var Logs = require('../../model/logs');
var router = express.Router();

router.get('/log', function (req, res, next) {
    Logs.find(function (findLogErr, foundLogs) {
        if(findLogErr){return next(findLogErr); }
        if(foundLogs){
            res.render('admin/log.html', foundLogs);
        }
    });
});

module.exports = router;
