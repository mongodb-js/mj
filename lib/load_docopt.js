/* eslint no-sync:0 */
var path = require('path');
var fs = require('fs');

/**
 * Load the docopt interface definitions for a given command.
 */
module.exports = function(command) {
  var clifile = path.join(__dirname, '../docopts', command + '.docopt');
  return fs.readFileSync(clifile, 'utf-8');
};
