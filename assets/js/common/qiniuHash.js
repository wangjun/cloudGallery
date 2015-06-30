var hash = function (fileBinary) {
    this.fileBinary = fileBinary;
    this.prefix = '10';
};

hash.prototype.getSha1 = function () {
    var hash = CryptoJS.SHA1(this.fileBinary).toString();
    console.log(hash);
    console.log(hash.length);
    var sha1 = this.prefix+hash;
    console.log(sha1);
    this.hash = sha1;
    var base64Result = btoa(sha1);
    console.log(base64Result);
};