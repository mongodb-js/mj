var fs = require('fs'),
    debug = require('debug')('mj:help');

// Try and load the docopt src for a command
module.exports = function(args, done) {
  // make `mj help` (no additional arguments) behave like `mj --help`
  var cmd = args['<command>'] || 'main';
  var src = __dirname + '/../docopts/' + cmd + '.docopt';

  fs.exists(src, function(exists) {
    if (!exists) {
      return done(new Error('Unknown command `' + cmd + '`. See `mj help` for available commands.'));
    }
    fs.readFile(src, 'utf-8', function(err, help) {
      if (err) return done(err);
      // print help text
      console.log(help);
      return done(null, help);
    });
  });
};
