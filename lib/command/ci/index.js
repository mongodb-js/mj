var _ = require('lodash');
var before = require('./before');
var run = require('./run');
var after = require('./after');
var series = require('async').series;
var running = require('is-mongodb-running');
var debug = require('debug')('mj:command:ci');

module.exports.before = before;
module.exports.after = after;
module.exports.run = run;

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
  })

  _.map(argv, function(value, key) {
    if (_.startsWith(key, 'mongodb.')){
      argv.ci.mongodb[key.replace('mongodb.', '')] = value;
    }
  });

  // Override yargs default values with environment
  // variables if environment variables are set.
  /**
   * @todo (imlucas): Option value casting should be moved
   * to mongodb-runner.
   */
  if (_.isString(argv.ci.mongodb.enterprise)) {
    argv.ci.mongodb.enterprise = Boolean(argv.ci.mongodb.enterprise);
  }
}

module.exports.default = function(argv, done) {
  configure(argv);

  argv.ci._timeout = setTimeout(function() {
    argv.ci.killed = true;
    done(new Error('ci timeout reached!  something is very wrong!'));
  }, argv.ci.timeout);

  series([
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
    },
    after.bind(null, argv)
  ], function(err) {
    if (argv.ci.killed) {
      debug('killed by timeout. not applying callback for second time.');
    } else if (err) {
      debug('err', err);
      done(err);
    } else if (argv.ci.error){
      debug('argv.ci.error', argv.ci.error);
      done(argv.ci.error);
    } else {
      debug('complete!', argv.ci.res);
      done(null, argv.ci.res);
    }
  });
};
