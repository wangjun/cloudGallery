var Galleries = require('../../model/galleries');
var validator = {};

validator.isNotExist = function (galleryName) {
    Galleries.findOne({name:galleryName})
        .exec(function (err, data) {
            if(err){throw new Error('Validating gallery is existing occur an error.');}
            return data ? false : true;
        });
};

module.exports = validator;