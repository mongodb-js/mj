var Mocha = require('mocha');
var path = require('path');
var glob = require('glob');
var _ = require('lodash');
var format = require('util').format;
var spawn = require('child_process').spawn;
var after = require('./after');
var debug = require('debug')('mj:command:ci:run');

module.exports = function(argv, done) {
  var args = _.flatten([
    process.argv.slice(1),
    '_run',
    argv.toArray()
  ]);

  debug('spawning `%s` with args `%s`', process.execPath, args);
  var proc = spawn(process.execPath, args, { stdio: 'inherit' });
  proc.on('exit', function (code, signal) {
    debug('caught process exit.  running after...');
    after(argv, function(){
      debug('after complete.  goodbye.');
      if (signal) {
        process.kill(process.pid, signal);
      } else {
        process.exit(code);
      }
    });
  });

  // terminate children.
  process.on('SIGINT', function () {
    proc.kill('SIGINT'); // calls runner.abort()
    proc.kill('SIGTERM'); // if that didn't work, we're probably in an infinite loop, so make it die.
  });
};
