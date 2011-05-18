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

/**
 * the constructor for this implementation of knots
 * @param data unused as of now
 * @constructor
 */
function FsKnot (data) {
    Knot.apply(this);
}
util.inherits(FsKnot, Knot);
/**
 * also get 'inherit' static functions
 */
FsKnot.__proto__ = Knot; // this breaks _some_ things, but mostly works


/**
 * a function to actually write the content of a field on the filesystem
 */
function writeKnotField (dir, property, content, _cb) {
    var cb = _cb || noop;
    fs.writeFile(dir+'/'+property, JSON.stringify(content)+"\n", 'utf8', cb);
}

/**
 * Save the knot on the filesystem
 * @method
 * @param cb a function to be called on completion (err, knotid)
 */
FsKnot.prototype.save = function save(_cb) {
    var cb = _cb || noop;
    var _id = this.id();
    var knotdir = FsKnot.dbdir+'/'+_id;
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
        if(props[i] === '_parent') {
            --sem;
            continue;
        }
        writeKnotField(knotdir, props[i], this[props[i]], writecallback);
    }
};

/**
 * static function retrieving a knot from the filesystem
 * note that only the knot's own fields are retrieved
 * see Knot::populateParents
 * @param id the id of the knot we want to retrieve
 * @param cb a function to be called on completion. (err, knot)
 */
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
        for(var k in o) {
            res[k] = o[k];
        }
        return cb(null, res);
    }
}

/**
 * A static function to definitely remove a knot from the filesystem
 * @param knot the id of the knot or the actual knot to remove
 * @param cb a function to be called on completion. (err)
 */
FsKnot.remove = function remove (knot, _cb) {
    var knotid = knot instanceof this ? knot.id() : knot;
    var cb = _cb;
    // we will have to walk the directory and remove every entry in there
    // This is gonna be callback hellish, hurray \o/
    // FIXME what about child knots?
    var knotdir = FsKnot.dbdir+'/'+knotid;
    fs.stat(knotdir, function(err, stat) {
        if(!stat.isDirectory())
            return _cb(new TypeError(knotdir+" is not a directory"));

        fs.readdir(knotdir, function(err, files) {
            var sem = files.length;
            for (var i = 0; i < files.length; ++i) {
                fs.unlink(knotdir+'/'+files[i], function(err) {
                    if(err) return cb(err);
                    if(--sem) return oncomplete(null);
                    // not that hellish
                    // since we don't have subdirectories
                });
            }
        })
    })

    function oncomplete () {
        fs.rmdir(knotdir, cb);
    }
}


FsKnot.list = function list (parent, callback) {
    var cb = callback ? callback : (parent ? parent : noop);
    var parentid = parent instanceof this ?
                parent.id() : (parent instanceof Function ? null : parent);
    var l = [];
    fs.readdir(FsKnot.dbdir, function(err, files) {
        if(err) return cb(err);
        var sem = files.length;
        files.forEach(function(f) {
            FsKnot.get(f, function(err, k) {
                if(err) return cb(err);
                if(!parentid) {
                    l.push(k);
                    if(--sem > 0) return;
                    return cb(null, l);
                }
                else {
                    k.isA(parentid, function(err, is) {
                        if(err) return cb(err);
                        if(is) l.push(k);
                        if(--sem > 0) return;
                        return cb(null, l);
                    })
                }
            })
        })
    });
}


/**
 * the directory in which to look for knots
 */
FsKnot.dbdir = process.cwd()+'/fsdb';

module.exports = FsKnot;
