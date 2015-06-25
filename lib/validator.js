var expressValidator = require('express-validator');
var handyObject = require('../lib/handy/object');
var galleryValidator = require('./gallery/validator');
var customValidator = handyObject.concat([
    galleryValidator
]);
var validator = expressValidator({
    customValidator:customValidator
});

module.exports = validator;