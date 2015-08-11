'use strict';
var logs = require('../../model/logs');
var Log = {};
Log.add = function (type, content, titleArg, uriArg, levelArg) {
    var title = titleArg || '';
    var uri = uriArg || '';
    var level = levelArg || 0;
    let newLog = new logs({
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

module.exports = Log;
