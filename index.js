var fs = require('fs'),
    parseCmd = require('./util/parse_cmd'),
    path = require('path'),
    debug = require('debug')('mj');

function wrapCommand(cmd) {
  return function(args, done) {
    // parse cmd line arguments, use args string if provided
    var argv = parseCmd(cmd, args);

    // defaults
    argv['<directory>'] = path.resolve(argv['<directory>']) || process.cwd();
    
    debug('running command `%s`', cmd);
    require('./commands/' + cmd)(argv, function(err, res) {
      done(err, res);
    });
  };
}

var commands = {};
fs.readdirSync(__dirname + '/commands').forEach(function(file) {
  var name = file.replace('.js', '');
  commands[name] = wrapCommand(name);
});
debug('Loaded commands %s', Object.keys(commands));

module.exports = commands;
