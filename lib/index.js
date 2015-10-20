/* eslint no-console:0 */
var docopt = require('docopt').docopt;
var pkg = require('../package.json');
var path = require('path');
var loadDocopt = require('./load_docopt');

module.exports = function() {
  // defaults
  var options = {
    options_first: true,
    version: pkg.version
  };

  // first load main interface to get command
  var cli = loadDocopt('_main');
  var args = docopt(cli, options);
  var cmd = args['<command>'];

  if (cmd === '_main') {
    // special case, just to prevent strange error if someone tries `_main` as command
    console.error('Unknown command "_main". See "mj help" for available commands.');
    process.exit(1);
  }

  if (cmd === undefined) {
    // script doesn't use command style, just run its index.js file
    cmd = 'index';
  } else {
    // load command interface
    cli = loadDocopt(cmd);
    options.options_first = false;
    args = docopt(cli, options);
  }

  // load command for this script
  var cmdfn = require(path.join('../commands/', cmd));
  cmdfn(args, function(err) {
    if (err) {
      console.error(err.message);
      process.exit(1);
    } else {
      process.exit(0);
    }
  });
};
