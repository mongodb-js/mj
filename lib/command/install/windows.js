/* eslint camelcase:0 */
var mkdirp = require('mkdirp');
var Download = require('download');
var series = require('run-series');
var partial = require('lodash').partial;
var config = require('./config');
var env = require('./env');
var run = require('./run');
var npm = require('./npm');
var debug = require('debug')('mj:install:windows');

function env_variables(fn) {
  debug('setting up environment variables for nodist...');
  series([
    partial(env.set, 'NODIST_X64', '0'),
    partial(env.set, 'NODIST_PREFIX', config.NODIST_PREFIX)
  ], function(err) {
    if (err) {
      return fn(err);
    }
    fn();
  });
}

function nodist_use(version, fn) {
  run('nodist', [version], fn);
}

function nodist_download(fn) {
  var on_downloaded = function() {
    debug('downloaded nodist successfully!');
    fn();
    // var src = path.join(config.NODIST_DEST, 'nodist-' + config.NODIST_VERSION);
    // fs.move(src, config.NODIST_PREFIX, function(err) {
    //   if (err) return fn(err);
    //
    //   console.log('moved to %s', config.NODIST_PREFIX);
    //   fn();
    // });
  };

  var opts = {
    extract: true
  };

  debug('downloading nodist v%s...', config.NODIST_VERSION);

  mkdirp(config.NODIST_DEST, function() {
    new Download(opts).get(config.NODIST_URL, config.NODIST_DEST).run(on_downloaded);
  });
}

module.exports = function(opts, done) {
  series([
    nodist_download,
    env_variables,
    partial(nodist_use, config.NODIST_USE),
    npm.configure,
    partial(npm.install, 'npm', config.NPM_VERSION),
    npm.installNodeGyp
  ], done);
};
