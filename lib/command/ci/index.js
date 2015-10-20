var _ = require('lodash');
var before = require('./before');
var run = require('./run');
var after = require('./after');
var series = require('async').series;
var debug = require('debug')('mj:command:ci');

module.exports.before = before;
module.exports.after = after;
module.exports.run = run;

function configure(argv, done){
  // @todo (imlucas): make argv into a real ampersand model
  // called `CommandOptions`.
  argv.ci = {
    failed: false,
    error: undefined,
    res: undefined,
    timeout: undefined,
    killed: false,
    mongodb: {}
  };

  _.defaults(argv.ci, {
    timeout: 1000 * 60 * 60 * 10 // 10 minutes
  })

  argv.ci._timeout = setTimeout(function() {
    argv.ci.killed = true;
    done(new Error('ci timeout reached!  something is very wrong!'));
  }, argv.timeout);

  // argv.ci.mongodb = _.mapKeys(argv, function(key) {
  //   if (!_.startsWith(key, 'mongodb.')) return undefined;
  //   return key.replace('mongodb.', '');
  // });
  console.log('argv.ci.mongodb', argv.ci.mongodb);

  // Override yargs default values with environment
  // variables if environment variables are set.
  // _.assign(argv.ci.mongodb, {
  //   version: process.env.MONGODB_VERSION,
  //   topology: process.env.MONGODB_TOPOLOGY,
  //   enterprise: process.env.MONGODB_ENTERPRISE
  // });

  /**
   * @todo (imlucas): Option value casting should be moved
   * to mongodb-runner.
   */
  if (_.isString(argv.ci.mongodb.enterprise)) {
    argv.ci.mongodb.enterprise = Boolean(argv.ci.mongodb.enterprise);
  }
  console.log('argv is: %j', argv);
  done(null, argv);
}

module.exports.default = function(argv, done) {
  series([
    configure.bind(null, argv),
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
      done(err);
    } else if (argv.ci.error){
      done(argv.ci.error);
    } else {
      done(null, argv.ci.res);
    }
  });
};
