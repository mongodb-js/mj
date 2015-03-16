var fs = require('fs'),
  commands = {},
  debug = require('debug')('mj');

function loadCommand(cmd) {
  return function(argv, done) {
    // defaults
    argv.directory = argv['<directory>'] || process.cwd();
    
    debug('running command `%s`', cmd);
    require('./commands/' + cmd)(argv, function(err, res) {
      done(err, res);
    });
  };
}

fs.readdirSync(__dirname + '/commands').forEach(function(file) {
  var name = file.replace('.js', '');
  commands[name] = loadCommand(name);
});

debug('Loaded commands %s', Object.keys(commands));

module.exports = commands;
