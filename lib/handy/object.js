var handyObject = {};

handyObject.concat = function (objects) {
    var result = {};
    for (var i = 0; i < objects.length; i++) {
        if (typeof objects[i] === 'object') {
            for (key in objects[i]) {
                if (objects[i].hasOwnProperty(key)) {
                    if(result.hasOwnProperty(key)){
                        throw new Error('It is not allow to concat with objects have same property.');
                    }else{
                        result[key] = objects[i];
                    }
                }
            }
        } else {
            throw new TypeError('values must be Objects.')
        }
    }
    return result;
};

module.exports = handyObject;