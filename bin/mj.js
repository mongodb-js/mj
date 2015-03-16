#!/usr/bin/env node

var DOCOPT_DIR = __dirname + '/../docopts/';

var docopt = require('docopt').docopt,
  pkg = require(__dirname + '/../package.json'),
  fs = require('fs'),
  debug = require('debug')('mj:bin');

var cli = fs.readFileSync(DOCOPT_DIR + 'main.docopt', 'utf-8');
var argv = docopt(cli, {
  version: pkg.version,
  options_first: true
});

// make `mj help` (no additional arguments) behave like `mj --help`
if ((argv['<command>'] === 'help') && (argv['<args>'].length === 0)) {
  debug('treat `mj help` like `mj --help`');
  // only output main help screen
  console.log(cli);
  process.exit(0);
} 

// pass on to sub parser
var cmd = argv['<command>'];
try {
  cli = fs.readFileSync(DOCOPT_DIR + cmd + '.docopt', 'utf-8');
} catch (e) {
  console.error('Unknown command "' + cmd + '". See "mj help" for available commands.');
  process.exit(1);
}

argv = docopt(cli, {
  version: pkg.version,
  options_first: false
});

debug('argv', argv);

var mj = require('../');
mj[cmd](argv, function(err, res) {
  debug('command returned', err, res);
  if (err) {
    console.error(err);
    return process.exit(1);
  }
  console.log('ok');
});
