var _ = require('lodash');
var format = require('util').format;
var spawn = require('child_process').spawn;
var debug = require('debug')('mj:command:ci:test');

module.exports = function(argv, done) {
  var args = _.flatten([
    process.argv.slice(1),
    'test_',
    argv.toArray()
  ]);

  debug('spawning `%s` with args `%s`', process.execPath, args);
  var proc = spawn(process.execPath, args, {stdio: ''});
  proc.on('message', function(d) {
    debug('got message from child `%j`', d);
    if (d.failures !== undefined) {
      debug('Tests complete.  %d failures', d.failures);
      argv.ci.failed = d.failures > 0;
      if (d.failures === 0) {
        done();
        return;
      }
      done(new Error(format('%d tests failed', d.failures)));
      return;
    } else if (d.error) {
      done(new Error(d.error.message));
      return;
    }
    done(new Error('Unknown message from _test!  ' + JSON.stringify(d)));
  });

  proc.on('exit', function(code) {
    debug('Tests complete.  %d failures', code);
    argv.ci.failed = code > 0;
    if (code === 0) {
      done();
      return;
    }
    done(new Error(format('%d tests failed', argv.ci.failed)));
  });

  // terminate children.
  process.on('SIGINT', function() {
    proc.kill('SIGINT'); // calls runner.abort()
    proc.kill('SIGTERM'); // if that didn't work, we're probably in an infinite loop, so make it die.
  });
};
