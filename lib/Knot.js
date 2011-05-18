var util = require('util');
var EventEmitter = require('events').EventEmitter;
var crypto = require('crypto');

function md5 (str) {
    var h = crypto.createHash('md5');
    h.update(str);
    return h.digest('hex');
}

function notimpl (name) {
    return function notImplemented () {
        var subject = this instanceof Function ? this : this.constructor;
        throw new Error(subject.name+"::"+name+" not implemented");
    }
}

/**
 * a Knot is the base datatype in Nigel. Except for a few properties
 * it is a collection of type:value associated with field_names
 *
 * this is the base class from which all implementation should inherit
 *
 * reserved field names begin with an underscore
 *      _id
 *      _name
 *      _created_at
 *      _updated_at
 *      _parent
 *      _parent_id
 * @constructor
 */
function Knot () {
    this.created_at = new Date();
}
util.inherits(Knot, EventEmitter);

Knot.prototype.id = function id() {
    return this._id || (this._id = md5(JSON.stringify(this)+Date.now()));
};

Knot.prototype.setParent = function setParent(parent) {
    var parentid = parent instanceof this.constructor ? parent.id() : parent;
    this._parent_id = parentid;
    if(parent instanceof Knot) this._parent = parent;
};
/**
 * fetch and populate the parent knots of this particular knot.
 * this method is implementation independant. subclasses may override it
 * for performance.
 * @method
 * @param cb a function to be called on completion. (err)
 */
Knot.prototype.populateParents = function populateParents(cb) {
    if(!this._parent_id) return cb();
    var get = this.constructor.get; // get adequate static function
    var self = this;
    get(this._parent_id, function(err, knot) {
       if(err) return cb(err);
       self._parent = knot;
       knot.populateParents(cb);
    })
};

/**
 * Create a new knot having this not as parent
 * @return a brand new knot
 */
Knot.prototype.createFrom = function createFrom() {
    var res = new this.constructor;
    res.setParent(this);
    return res;
};

/**
 * tells if this knot has a given ancestor
 * @param parent knot or knot id of the ancestor
 * @param callback callback
 */
Knot.prototype.isA = function isA(parent, _inclusive, callback) {
    var cb = arguments[arguments.length -1] || noop;
    var inclusive = typeof _inclusive === 'function' ? null : _inclusive;
    var parentid = parent instanceof this.constructor ? parent.id() : parent;
    
    if(inclusive && parentid === this.id()) return cb(null, true);

    var self = this;
    console.log('parentid is %s', parentid);
    this.populateParents(function(err) {
        if(err) return cb(err);
        var k = self;
        while(k = k._parent) {
            console.log('k.id = %s', k.id())
            if(k.id() == parentid) 
                return cb(null, true);
        }
        return cb(null, false);
    })
};

Knot.prototype.save = notimpl('save');
Knot.remove = notimpl('remove');
Knot.get = notimpl('get');
Knot.list = notimpl('list');

module.exports = Knot;
