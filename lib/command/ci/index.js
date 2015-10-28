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
    mongodb: {},
    verified: true
  });

  argv.ci.timeout_minutes = argv.ci.timeout / 1000 / 60 / 60;

  // Override yargs default values with environment
  // variables if environment variables are set.
  /**
   * @todo (imlucas): Option value casting should be moved
   * to mongodb-runner.
   */
  if (_.isString(argv.ci.mongodb.enterprise)) {
    argv.mongodb.enterprise = Boolean(argv.mongodb.enterprise);
  }
  process.env.CI = '1';
  process.env.NODE_ENV = 'testing';
}

module.exports.default = function(argv, done) {
  configure(argv);

  argv.ci._timeout = setTimeout(function() {
    argv.ci.killed = true;
    done(new Error('ci timeout reached!  something is very wrong!'));
  }, argv.ci.timeout);

  debug('timeout set to kill this job if it takes more than %d minutes',
    argv.ci.timeout_minutes);

  series([
    function(cb) {
      setup.verify(argv, cb);
    },
    function(cb) {
      if (argv.ci.verified) {
        argv.ok('ci before', 'Environment requirements verified.');
      } else {
        argv.warn('ci before',
          'Warranty voided because environment does not meet requirements.');
      }
      cb();
    },
    before.bind(null, argv),
    function(cb) {
      test(argv, function(err) {
        if (err) {
          argv.ci.failed = true;
          argv.ci.error = err;
          argv.warn('ci test', 'failed');
          cb();
          return;
        }
        argv.ok('ci test', 'passed');
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
