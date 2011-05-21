var util = require('util');
var Knot = require('../lib/FsKnot');

module.exports = function knots(req, res, next) {
    console.log('got request', req.params);
    if(req.params.id) {
        if(!req.params.action) {
            return showKnot(req, res, next);
        }
        return editKnot(req, res, next);
    }
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
        res.write(util.inspect(k));
        res.end('\n');
    })
}

function editKnot (req, res, next) {
    Knot.get(req.params.id, function(err, k) {
        if(err) return next(err);
        res.render('edit-knot', {
            locals: {
                title: "edit knot",
                knot: k
            }
        })
    })
}
