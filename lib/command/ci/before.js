/**
 * @todo (imlucas) Run `mj security-audit` and `mj check`
 * before starting mongodb for nice fast failures.
 * @todo (imlucas) check if we're not in evergreen
 * compile task (`process.env.EVERGREEN_TASK_NAME`?)
 * and if so, restore `./node_modules/` .zip cache
 * from S3.
 */
// var path = require('path');
// var nsp = require('nsp/lib/auditPackage');
// var check = require('mongodb-js-precommit');
var async = require('async');
var runner = require('mongodb-runner');
var mvm = require('mongodb-version-manager');
var debug = require('debug')('mj:command:ci:before');

exports.command = 'ci-before';

var series = function(command, argv, spec, done) {
  var tasks = [];
  Object.keys(spec).forEach(function(name) {
    tasks.push(function(cb) {
      var title = [command, name].join(' ');
      argv.spinner(title);
      spec[name].call(null, function(err) {
        if (err) {
          cb(err);
          return;
        }

        argv.ok(title);
        cb();
      });
    });
  });
  async.series(tasks, done);
};

module.exports = function(argv, done) {
  argv.mongodb.action = 'start';
  series(exports.command, argv, {
    // @todo (imlucas): `ps` failing unexpected on evergreen....
    // 'check if another mongodb instance is already running': require('is-mongodb-running'),
    // 'checking for known security vulnerabilities': function(cb){
    //   nsp(path.join(argv.directory, 'package.json'), function(err, res){
    //     if(err){
    //       return cb(err);
    //     }
    //     debug('nsp results', res);
    //     cb();
    //   });
    // },
    // 'static analysis': check,
    'install mongodb': function(cb) {
      var options = {
        version: argv.mongodb.version
      };
      mvm.use(options, cb);
    },
    'start mongodb': function(cb) {
      debug('starting mongodb with options `%j`', argv.mongodb);
      runner(argv.mongodb, cb);
    }
  }, done);
};
