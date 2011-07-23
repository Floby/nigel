var vows = require('vows');
var assert = require('assert');
var EventEmitter = require('events').EventEmitter;


vows.describe("Knot interface").addBatch({
    "The knot module": {
        topic: '../lib/Knot',
        "can be loaded": function(path) {
            var Knot = require(path);
            assert.isFunction(Knot);
            assert.equal('Knot', Knot.name, 'function name');
        },
        "- Knot class": {
            topic: function(path) {return require(path)},
            "Can be instanciated": function(Knot) {
                var knot = new Knot;
            },
            "- Knot instance": {
                topic: function(Knot) {return new Knot},
                "is an event emitter": function(knot) {
                    assert.instanceOf(knot, EventEmitter);
                },
                "has its created_at property automatically set": function(knot) {
                    assert.notEqual(knot._created_at, undefined);
                    assert.equal(knot._created_at.constructor, Date);
                }
            }
        }
    }
}).export(module);
