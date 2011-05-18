function controller (name) {
    return function route(req, res, next) {
        res.end("you've got yourself a knot ;)\n");
    }
}

exports.setup_routes = function setup_routes (app) {
    app.get('/', function(req, res){
      res.render('index', {
        title: 'Nigel'
      });
    });

    app.get('/knots/:id?', controller('knots'));
}
