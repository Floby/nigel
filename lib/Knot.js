var util = require('util');
var EventEmitter = require('events').EventEmitter;

function Knot () {
    // thistis a base classes for all
    // knots knobs or whatever I'm gonna call them
    // but node is already taken by drupal and nodejs
    this.created_at = new Date();
}
sys.inherits(Knot, EventEmitter);
