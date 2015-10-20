/**
 * @todo (imlucas) Run `mj security-audit` and `mj check`
 * before starting mongodb for nice fast failures.
 * @todo (imlucas) check if we're not in evergreen
 * compile task (`process.env.EVERGREEN_TASK_NAME`?)
 * and if so, restore `./node_modules/` .zip cache
 * from S3.
 */
var runner = require('mongodb-runner');
var debug = require('debug')('mj:command:ci:before');

module.exports = function(argv, done) {
  argv.mongodb.action = 'start';

  debug('starting mongodb with options `%j`', argv.ci.mongodb);
  argv.spinner('Starting MongoDB...');
  runner(argv.ci.mongodb, function(err) {
    debug('runner returned `%j`', arguments);
    argv.stopSpinner();
    if (err) {
      return done(argv.error('Starting MongoDB', err));
    }

    argv.ok('MongoDB started');
    done();
  });
};
