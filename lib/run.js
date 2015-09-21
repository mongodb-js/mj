var config = require('./config');
var fs = require('fs-extra');
var path = require('path');
var format = require('util').format;
var spawn = require('child_process').spawn;
var which = require('which');
var debug = require('debug')('mongodb-scout-bootstrap:run');

function getBinPath(cmd, fn) {
  if (config.PLATFORM === 'windows') {
    cmd += '.cmd';
  }
  which(cmd, function(err, bin) {
    if (err) {
      bin = path.join(config.BIN_DIRECTORY, cmd);
    }
    fs.exists(bin, function(exists) {
      if (!exists) {
        return fn(new Error(format(
          'Expected file for `%s` does not exist at `%s`',
          cmd, bin)));
      }
      fn(null, bin);
    });
  });
  // var bin;
  // if (cmd === 'bash') {
  //
  //   bin = '/bin/bash';
  // } else {
  //   bin = path.join(config.BIN_DIRECTORY, cmd);
  // }
  // if (config.PLATFORM === 'windows') {
  //   bin += '.cmd';
  // }
  // fs.exists(bin, function(exists) {
  //   if (!exists) {
  //     return fn(new Error(format(
  //       'Expected file for `%s` does not exist at `%s`',
  //       cmd, bin)));
  //   }
  // });
}
module.exports = function(cmd, args, opts, fn) {
  if (typeof opts === 'function') {
    fn = opts;
    opts = {};
  }
  if (typeof args === 'function') {
    fn = args;
    args = [];
    opts = {};
  }
  getBinPath(cmd, function(err, bin) {
    if (err) return fn(err);

    debug('running %j', {
      cmd: cmd,
      args: args,
      opts: opts
    });

    var proc = spawn(bin, args, opts);
    proc.stdout.pipe(process.stdout);
    proc.stderr.pipe(process.stderr);
    proc.on('exit', function(code) {
      if (code !== 0) {
        debug('command failed! %j', {
          cmd: cmd,
          bin: bin,
          args: args,
          opts: opts,
          code: code
        });
        process.exit(code);
      }
      debug('completed! %j', {
        cmd: cmd,
        bin: bin,
        args: args,
        opts: opts,
        code: code
      });
      fn();
    });
  });
};
