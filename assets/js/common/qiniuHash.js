var hash = function (buffer) {
    this.buffer = buffer;
    this.prefix = 0x16;
    this.blockSize = 4*1024*1024;
    this.sha1String = [];
    this.blockCount = 0;
    this.Buffer = window.ArrayBuffer;
};

hash.prototype.getSha1 = function () {
    //var hash = CryptoJS.SHA1(this.buffer);
    //var hash1 = hash.toString(CryptoJS.enc.Hex);
    //console.log(hash1);
    //console.log(hash);
    //var sha1 = this.prefix+hash;
    //console.log(sha1);
    //this.hash = sha1;
    //var base64Result = btoa(sha1);
    //console.log(base64Result);

    var bufferSize = this.buffer.byteLength;
    console.log(bufferSize);
    this.blockCount = Math.ceil(bufferSize / this.blockSize);

    for(var i=0;i<this.blockCount;i++){
        this.sha1String.push(this.sha1(this.buffer.slice(i*this.blockSize,(i+1)*this.blockSize)));
    }
    this.calcEtag();
};

// sha1算法
hash.prototype.sha1 = function(content){
    var sha1 = CryptoJS.algo.SHA1.create();
    sha1.update(content);
    var i = sha1.finalize();
    console.log(i);
    return i;


};


hash.prototype.calcEtag = function (){
    if(!this.sha1String.length){
        return 'Fto5o-5ea0sNMlW_75VgGJCv2AcJ';
    }
    var sha1Buffer = this.Buffer.concat(this.sha1String,this.blockCount * 20);

    // 如果大于4M，则对各个块的sha1结果再次sha1
    if(this.blockCount > 1){
        this.prefix = 0x96;
        sha1Buffer = this.sha1(sha1Buffer);
    }

    sha1Buffer = this.Buffer.concat(
        [new this.Buffer([this.prefix]),sha1Buffer],
        sha1Buffer.length + 1
    );

    var result = sha1Buffer.toString('base64')
        .replace(/\//g,'_').replace(/\+/g,'-');
    console.log(result);
    return result;

};