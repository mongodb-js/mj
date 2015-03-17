var docopt = require('docopt').docopt,
    pkg = require('../package.json'),
    loadDocopt = require('./load_docopt'),
    debug = require('debug')('mj:util');

module.exports = function parseCmd(cmd, str, options_first) {
  // defaults
  var options = {
    options_first: options_first || false,
    version: pkg.version
  }
  if (str) {
    // split on whitespace and prepend command
    options['argv'] = str.split(' ');
    options['argv'].unshift(cmd);
  }

  try {
    var cli = loadDocopt(cmd);
  } catch (e) {
    console.error('Unknown command "' + cmd + '". See "mj help" for available commands.');
    process.exit(1);
  }

  return docopt(cli, options);
}