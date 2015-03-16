var fs = require('fs'),
  commands = {},
  debug = require('debug')('mj');

fs.readdirSync(__dirname + '/commands').forEach(function(file) {
  var name = file.replace('.js', '');
  commands[name] = require('./commands/' + name);
});
debug('Loaded commands %s', Object.keys(commands));

module.exports = function(argv, done) {
  debug('normalizing options', argv);

  argv.directory = argv['<directory>'] || process.cwd();
  debug('normalized options to', argv);

  var name = argv['<command>'];
  if (!commands[name]) {
    return process.nextTick(done.bind(null, new Error('Unknown command `' + name + '`')));
  }

  debug('running command `%s`', name);
  commands[name](argv, function(err, res) {
    done(err, res);
  });
};
