'use strict';
var galleries = require('../../model/galleries');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var gallery = {};
gallery.removeOne = function (idString, cb) {
    var id = new ObjectId(idString);
    galleries.findOne({_id: id})
        .populate('images')
        .exec(function (findGalleryErr, foundGallery) {
        if(findGalleryErr){return {state: 1, err: findGalleryErr, msg: 'find gallery error'}; }
        if(foundGallery){
            var removeThisGallery = function (thisRemovedImages) {
                var removedImages = thisRemovedImages || [];
                foundGallery.remove(function (removeGalleryErr, removedGallery) {
                    if(removeGalleryErr){return {state: 4, msg: 'Remove gallery error.', err: removeGalleryErr}; }
                    return {state: 3, msg: 'Gallery removed.', removedGallery: removedGallery, removedImages: removedImages};
                });
            };
            if(foundGallery.images.length){
                foundGallery.images.forEach(function (image) {
                    var removedImages = [];
                    image.remove(function (removeImageErr, removedImage) {
                        if(removeImageErr){return {state: 6, msg: 'remove image error', err: removeImageErr}; }
                        removedImages.push(removedImage);
                        if(removedImages.length === foundGallery.images.length){
                            removeThisGallery();
                        }
                    });
                });
            }else{
                removeThisGallery();
            }
        }else{
            return {state: 2, msg: 'found no gallery.'};
        }
    });
};

module.exports = gallery;
