#!/usr/bin/env node

var parseCmd = require('../util/parse_cmd'),
    mj = require('../'),
    debug = require('debug')('mj:bin');

var argv = parseCmd('main', null, true);
var cmd = argv['<command>'];
debug('parsed command `' + cmd + '`');

if (!mj.hasOwnProperty(cmd)) {
  console.error('Unknown command `' + cmd + '`. See `mj help` for available commands.');
  return process.exit(1);
}

mj[cmd](null, function(err, res) {
  debug('command returned', err, res);
  if (err) {
    debug('error:', err.message);
    return process.exit(1);
  }
  debug('ok');
});
