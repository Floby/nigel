var util = require('util');
var Knot = require('../lib/FsKnot');

module.exports = function knots(req, res, next) {
    if(req.params.id) return showKnot(req, res, next);
    return listKnots(req, res, next);
}

function listKnots (req, res, next) {
    Knot.list(function(err, knots) {
        if(err) return next(err);
        res.write('showing '+knots.length+' knots\n');
        knots.forEach(function(k) {
            res.write(k._id+'\n');
        })
        res.end();
    });
}

function showKnot (req, res, next) {
    Knot.get(req.params.id, function(err, k) {
       //if(err) return next(err);
        res.write(util.inspect(k));
        res.end('\n');
    })
}
