var _ = require('lodash');
var before = require('./before');
var test = require('./test');
var after = require('./after');
var setup = require('../setup');

var series = require('async').series;
var debug = require('debug')('mj:command:ci');

module.exports.before = before;
module.exports.after = after;
module.exports.test = test;
module.exports.test_ = require('./test_');

function configure(argv) {
  // @todo (imlucas): make argv into a real ampersand model
  // called `CommandOptions`.
  argv.ci = {};

  _.defaults(argv.ci, {
    timeout: 1000 * 60 * 60 * 10, // 10 minutes
    failed: false,
    error: undefined,
    res: undefined,
    killed: false,
    mongodb: {}
  });

  // Override yargs default values with environment
  // variables if environment variables are set.
  /**
   * @todo (imlucas): Option value casting should be moved
   * to mongodb-runner.
   */
  if (_.isString(argv.ci.mongodb.enterprise)) {
    argv.mongodb.enterprise = Boolean(argv.mongodb.enterprise);
  }
}

module.exports.default = function(argv, done) {
  configure(argv);

  argv.ci._timeout = setTimeout(function() {
    argv.ci.killed = true;
    done(new Error('ci timeout reached!  something is very wrong!'));
  }, argv.ci.timeout);

  series([
    setup.bind(null, argv),
    setup.verify.bind(null, argv),
    before.bind(null, argv),
    function(cb) {
      test(argv, function(err) {
        if (err) {
          argv.error('test', err);
          argv.ci.failed = true;
          argv.ci.error = err;
          cb();
          return;
        }
        argv.ok('test passed');
        cb();
      });
    },
    after.bind(null, argv)
  ], function(err) {
    if (argv.ci.killed) {
      debug('killed by timeout. not applying callback for second time.');
    } else if (err) {
      debug('err', err);
      done(err);
    } else if (argv.ci.error) {
      debug('argv.ci.error', argv.ci.error);
      done(argv.ci.error);
    } else {
      debug('complete!', argv.ci.res);
      done(null, argv.ci.res);
    }
  });
};
