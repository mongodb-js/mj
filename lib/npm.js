var config = require('./config');
var run = require('./run');
var env = require('./env');

var debug = require('debug')('mongodb-scout-bootstrap:npm');

exports.configure = function(fn) {
  debug('configuring...');
  run('npm', ['config', 'set', 'prefix', config.BIN_DIRECTORY], function(err) {
    if (err) return fn(err);

    debug('setting environment variables so package bin files are accessible...');
    env.PATH.add(config.BIN_DIRECTORY, function(err, added) {
      if (err) return fn(err);
      if (added) {
        debug('already in $PATH');
      } else {
        debug('added `%s` to $PATH', config.BIN_DIRECTORY);
      }
      fn();
    });
  });
};

exports.getVersion = function(fn) {
  run('npm', ['--version'], fn);
};

exports.install = function(name, version, fn) {
  debug('installing npm module `%s`...', name);
  run('npm', ['install', '-g', [name, version].join('@'), '--loglevel', 'error'], fn);
};

exports.installNodeGyp = function(fn) {
  debug('installing node-gyp so native add-ons can be built...');
  exports.install('node-gyp-install', 'latest', function(err) {
    if (err) return fn(err);
    run('node-gyp-install', fn);
  });
};

module.exports = exports;
