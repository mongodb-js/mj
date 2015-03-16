var fs = require('fs');

// Try and load the docopt src for a command.
module.exports = function(args, done) {
  var cmd = args['<command>'],
    src = './docopts/' + cmd + '.docopt';

  fs.exists(src, function(exists) {
    if (!exists) {
      return done(new Error('Unknown command "' + cmd + '". See "mj help" for available commands.'));
    }
    fs.readFile(src, 'utf-8', function(err, help) {
      if (err) return done(err);
      return done(null, help);
    });
  });
};
