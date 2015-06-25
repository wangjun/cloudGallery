var expressValidator = require('express-validator');
var galleryValidator = require('./gallery/validator');
var validator = expressValidator({
    customValidator:{

    }
});

module.exports = validator;