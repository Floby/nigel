var util = require('util');
var fs = require('fs');
var crypto = require('crypto');

function noop() {};

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


function writeKnotField (dir, property, content, _cb) {
    var cb = _cb || noop;
    fs.writeFile(dir+'/'+property, JSON.stringify(content)+"\n", 'utf8', cb);
}

FsKnot.prototype.save = function save(_cb) {
    var cb = _cb || noop;
    console.log('entering save')
    var _id = this._id = this._id || md5(JSON.stringify(this) + Date.now());
    var knotdir = FsKnot.dbdir+'/'+_id;
    console.log(knotdir)
    try {
        fs.mkdirSync(knotdir, 0774); // TODO make this async
    } catch(e) {
       if(e.code !== 'EEXIST') throw(e);
    }

    function writecallback (err) {
        if(err) cb(err);
        else --sem;
        if(sem > 0) return;
        cb(null, _id);
    }
    var props = Object.getOwnPropertyNames(this);
    var sem = props.length;
    for (var i = 0; i < props.length; ++i) {
        if(props[i] === '_parent') continue;
        writeKnotField(knotdir, props[i], this[props[i]], writecallback);
    }
};

FsKnot.get = function get(id, _cb) {
    var cb = _cb || noop;
    var knotdir = FsKnot.dbdir+'/'+id;
    var self = this;
    var o = {};
    fs.readdir(knotdir, function(err, files) {
        if(err) return cb(err);
        var sem = files.length;
        function readdone(field) {
            return function readdone(err, content) {
                if(err) return cb(err);
                o[field] = JSON.parse(content);
                if(--sem > 0) return;
                // all fields read
                finishedreading();
            }
        }
        files.forEach(function(f) {
            var fpath = knotdir+'/'+f;
            fs.readFile(fpath, 'utf8', readdone(f));
        })
    })

    function finishedreading () {
        var res = new FsKnot();
        console.log('finished reading %s', o._id);
        console.log(res instanceof FsKnot);
        for(var k in o) {
            res[k] = o[k];
        }
        return cb(null, res);
    }
}


FsKnot.dbdir = process.cwd()+'/fsdb';

module.exports = FsKnot;
