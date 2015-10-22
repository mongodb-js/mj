var format = require('util').format;
var _ = require('lodash');
var before = require('./before');
var run = require('./run');
var after = require('./after');
var series = require('async').series;
var config = require('../../config');
var debug = require('debug')('mj:command:ci');

module.exports.before = before;
module.exports.after = after;
module.exports.run = run;
module.exports._run = require('./_run');

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

function verifyEnvironment(argv, done) {
  debug('verifying current environment meets requirements...');
  run('npm', ['version', '--json'], function(err, stdout) {
    if (err) return done(err);

    var versions = JSON.parse(stdout);

    if (versions.node !== config.NODE_VERSION) {
      argv.warn(format('Environment node v%s does not match mj\'s v%s. Warranty voided.',
      versions.node, config.NODE_VERSION));
    } else {
      argv.ok(format('Environment node v%s', versions.node));
    }

    if (versions.npm !== config.NPM_VERSION) {
      argv.warn(format('Environment npm v%s does not match mj\'s v%s. Warranty voided.',
      versions.node, config.NPM_VERSION));
    } else {
      argv.ok(format('Environment npm v%s', versions.npm));
    }
    done();
  });
}

module.exports.default = function(argv, done) {
  configure(argv);

  argv.ci._timeout = setTimeout(function() {
    argv.ci.killed = true;
    done(new Error('ci timeout reached!  something is very wrong!'));
  }, argv.ci.timeout);

  series([
    verifyEnvironment.bind(null, argv),
    before.bind(null, argv),
    function(cb) {
      run(argv, function(err, res) {
        if (err) {
          argv.ci.failed = true;
          argv.ci.error = err;
          cb();
          return;
        }
        argv.ci.res = res;
        cb();
      });
    }
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
