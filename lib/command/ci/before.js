/**
 * @todo (imlucas) Run `mj security-audit` and `mj check`
 * before starting mongodb for nice fast failures.
 * @todo (imlucas) check if we're not in evergreen
 * compile task (`process.env.EVERGREEN_TASK_NAME`?)
 * and if so, restore `./node_modules/` .zip cache
 * from S3.
 */
var runner = require('mongodb-runner');
var running = require('is-mongodb-running');
var debug = require('debug')('mj:command:ci:before');

module.exports = function(argv, done) {
  debug('running `%j`', argv);
  argv.ci.mongodb.action = 'start';
  running(function(err, res) {
    if (err) return done(err);

    debug('mongodb instances already running?', res);
    if (res.length > 0) {
      argv.warn('mongodb already running ' + JSON.stringify(res));
    }

    debug('starting mongodb with options `%j`', argv.ci.mongodb);
    argv.spinner('ci: starting mongodb');
    runner(argv.ci.mongodb, function(err) {
      debug('runner returned `%j`', arguments);
      argv.stopSpinner();
      if (err) {
        return done(argv.error('ci: start mongodb', err));
      }

      argv.ok('ci: mongodb started');
      done();
    });
  });
};
