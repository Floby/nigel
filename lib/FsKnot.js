var util = require('util');
var fs = require('fs');
var crypto = require('crypto');


function md5 (str) {
    var h = crypto.createHash('md5');
    h.update(str);
    return h.digest('hex');
}

var Knot = require('./Knot');

function FsKnot (data) {
    Knot.apply(this);
}
util.inherits(FsKnot, Knot);


function writeKnot (dir, property, content, cb) {
    fs.writeFile(dir+'/'+property, JSON.stringify(content)+"\n", 'utf8', cb);
}

FsKnot.prototype.save = function save(cb) {
    console.log('entering save')
    var _id = md5(JSON.stringify(this) + Date.now());
    this._id = _id;
    var knotdir = FsKnot.dbdir+'/'+_id;
    console.log(knotdir)
    fs.mkdirSync(knotdir, 0774);

    var sem = 0;
    var self = this;
    function writecallback (err) {
        if(err) cb(err);
        else --sem;
        if(sem > 0) return;
        cb(null, _id);
    }
    var props = Object.getOwnPropertyNames(this);
    sem = props.length;
    for (var i = 0; i < props.length; ++i) {
        writeKnot(knotdir, props[i], this[props[i]], writecallback);
    }
};


FsKnot.dbdir = process.cwd()+'/fsdb';


module.exports = FsKnot;
