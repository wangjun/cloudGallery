'use strict';
var crypto = require('crypto');
var utility = {};
utility.md5 = function (str) {
    return crypto.createHash('md5').update(str).digest('hex');
};

module.exports = utility;
