'use strict';
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var emailsSchema = new Schema({
    email: { type: String, 'default': 'NotSet' },
    code: { type: String },
    reqCodeDate: { type: Date, 'default': Date.now },
    isVerify: { type: Boolean, 'default': false }
});

var Emails = mongoose.model('Emails', emailsSchema);

module.exports = Emails;
