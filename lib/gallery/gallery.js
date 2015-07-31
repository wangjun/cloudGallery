'use strict';
var galleries = require('../../model/galleries');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var gallery = {};
gallery.removeOne = function (idString, cb) {
    var callback = cb || function(){};
    var id = new ObjectId(idString);
    var res = {};
    galleries.findOneAndRemove({_id: id}, function (removeErr, removedGallery) {
        if(removeErr){return removeErr; }
        if(removedGallery){
            res.state = 1;
            res.msg = 'Gallery:' + removedGallery ._id + ', removed!';
            console.log(res.msg);
            callback(res, removedGallery);
        }else{
            res.state = 2;
            res.msg = 'We can not find that gallery. Remove' + idString + ' failed.';
            console.log(res.msg);
            callback(res);
        }
    });
};

module.exports = gallery;
