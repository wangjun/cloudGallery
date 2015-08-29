'use strict';
var crypto = require('crypto');
var utility = {};
utility.md5 = function (str) {
    return crypto.createHash('md5').update(str).digest('hex');
};
utility.isObject = function (value) {
    if(value === null){
        return false;
    }else if(Array.isArray(value)){
        return false;
    }else{
        var valueType = typeof value;
        return valueType === 'object';
    }
};
module.exports = utility;
