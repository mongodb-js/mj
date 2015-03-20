'use strict';

var fs = require('fs');

var DOCOPT_DIR = '/../docopts/';

module.exports = function(cmd) {
  return fs.readFileSync(__dirname + DOCOPT_DIR + cmd + '.docopt', 'utf-8');
};