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
  var proc = spawn(process.execPath, args, {stdio: 'inherit'});
  // var output = [];
  // proc.stdout.on('data', function(buf) {
  //   debug('  test> %s', buf.toString('utf-8'));
  //   output.push(buf);
  // });
  // proc.stderr.on('data', function(buf) {
  //   debug('  test> %s', buf.toString('utf-8'));
  //   output.push(buf);
  // });

  proc.on('exit', function(code) {
    debug('Tests complete.  %d failures', code);
    argv.ci.failed = code > 0;
    if (code === 0) {
      done();
      return;
    }
    done(new Error(format('%d tests failed', code)));
  });

  // terminate children.
  process.on('SIGINT', function() {
    proc.kill('SIGINT'); // calls runner.abort()
    proc.kill('SIGTERM'); // if that didn't work, we're probably in an infinite loop, so make it die.
  });
};
