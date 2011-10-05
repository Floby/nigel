var util = require('util');
var express = require('express');

function controller (name) {
    var ctl;
    try {
        ctl = require('./'+name);
    } catch(e) {
        ctl = function(req, res, next) {
            next();
        }
    }
    return ctl;
}

function parseArgs (req, res, next) {
    var chain = req.params[0];
    if(!chain) return next();
    var split = chain.split('/');
    for (var i = 0; i < split.length; i=i+2) {
        var value = split[i+1] || true;
        req.params[split[i]] = value;
    }
    next();
}

function autoRoute (req, res, next) {
    return controller(req.params.controller)(req, res, next);
}

exports.setup_routes = function setup_routes (app) {
    app.get('/', function(req, res){
      res.render('index', {
        title: 'Nigel'
      });
    });

    app.get('/knots/:id?/:action?', controller('knots'));
    app.get('/:module/:controller/:action/*', parseArgs, autoRoute);
}
