var util = require('util');

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

exports.setup_routes = function setup_routes (app) {
    app.get('/', function(req, res){
      res.render('index', {
        title: 'Nigel'
      });
    });

    app.get('/knots/:id?', controller('knots'));
}
