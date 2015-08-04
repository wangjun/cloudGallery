'use strict';
var Logs = require('../../model/logs');

var log = {};

log.add = function (type, content, title, uri, level) {
    let newLog = new Logs({
        type: type,
        content: content,
        title: title,
        uri: uri,
        level: level
    });
    newLog.save(function (saveLogErr, savedLog) {
        if(saveLogErr){return saveLogErr; }
        if(!savedLog){
            return savedLog;
        }
    });
};

module.exports = log;
