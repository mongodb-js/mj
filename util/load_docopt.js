var fs = require('fs'),
    debug = require('debug')('mj:util');

var DOCOPT_DIR = '/../docopts/';

module.exports = function (cmd) {
  return fs.readFileSync(__dirname + DOCOPT_DIR + cmd + '.docopt', 'utf-8');
}