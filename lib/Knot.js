var util = require('util');
var EventEmitter = require('events').EventEmitter;

/**
 * a Knot is the base datatype in Nigel. Except for a few properties
 * it is a collection of type:value associated with field_names
 *
 * reserved field names begin with an underscore
 *      _id
 *      _name
 *      _created_at
 *      _updated_at
 * @constructor
 */
function Knot () {
    // this is a base class for all
    // knots knobs or whatever I'm gonna call them
    // but node is already taken by drupal and nodejs
    this.created_at = new Date();
}
util.inherits(Knot, EventEmitter);

Knot.prototype.create = function create() {
    return new this.constructor();
};

module.exports = Knot;
