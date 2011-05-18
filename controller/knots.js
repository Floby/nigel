var util = require('util');
var Knot = require('../lib/FsKnot');

module.exports = function knots(req, res, next) {
    res.writeHead(200, {
        "content-type": "text/plain"
    });
    res.write(util.inspect(req));
    res.end("\nyou've got yourself a knot ;)\n");
}
