var hash = function (buffer) {
    this.fileBinary = buffer;
    this.blockSize = 4*1024*1024;
    this.sha1String = [];
    this.prefix = 0x16;
};

hash.prototype.getHash = function () {
    var shaObj = new jsSHA("SHA-1", "BYTES");
    shaObj.update(this.buffer);
    var hash = shaObj.getHash("HEX");
    console.log(hash);
    this.hash = hash;
    var base64Result = btoa(hash);
    console.log(base64Result);
};

hash.sha1 = function () {

};
