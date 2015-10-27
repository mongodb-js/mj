var config = require('./config');
var run = require('./run');
var env = require('./env');
var taskmgr = require('./taskmgr');

var debug = require('debug')('mj:npm');


exports.setConfig = function(key, value, fn) {
  run('npm', ['config', 'set', key, value], fn);
};

exports.configure = function(fn) {
  debug('configuring...');
  var tasks = {
    'set loglevel': exports.setConfig.bind(null, 'loglevel', 'error'),
    'add bin to $PATH for globally installed modules': function(cb) {
      debug('setting environment variables so package bin files are accessible...');
      env.PATH.add(config.bin_directory, function(err, added) {
        if (err) {
          return cb(err);
        }
        if (added) {
          debug('already in $PATH');
        } else {
          debug('added `%s` to $PATH', config.bin_directory);
        }
        cb();
      });
    }
  };

  var options = {
    name: 'npm configure',
    spinner: true
  };

  taskmgr(tasks, options, fn);
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
    if (err) {
      return fn(err);
    }
    run('node-gyp-install', fn);
  });
};

module.exports = exports;
