'use strict';
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: 'QQ',
    auth: {
        user: 'system@lazycoffee.com',
        pass: '3351822E'
    }
});
module.exports = transporter;
