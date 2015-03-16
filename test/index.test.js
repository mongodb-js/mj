var mj = require('../'),
    fs = require('fs'),
    assert = require('assert'),
    exec = require('child_process').exec,
    debug = require('debug')('mj:test');

var BIN_MJ = __dirname + '/../bin/mj.js';
var DOCOPT_DIR = __dirname + '/../docopts/';

function mjWithArgs(args, callback) {
  // e.g. mjWithArgs("create --type cli")
  exec('node ' + BIN_MJ + ' ' + args, callback);
}

function loadHelpText(cmd) {
  return fs.readFileSync(DOCOPT_DIR + cmd + '.docopt', 'utf-8');
}

function containsLineWith(text, str) {
  if (!(str instanceof Array)) {
    str = [str];
  }
  var lines = text.split('\n');
  return str.every(function (s) {
    return lines.some(function (l) {
      return l.indexOf(s) !== -1;
    });
  });
}

function strip(str) {
  // strips leading and trailing whitespace
  return str.replace(/^\s+|\s+$/g, '');
}

describe('mj', function() {
  it('should be requireable', function() {
    assert(mj);
  });

  describe('--help', function (done) {
    it('should contain help for usage, options, commands, pointer to `mj help`', function (done) {
      mjWithArgs('help', function (err, stdout) {
        if (err) throw err;
        // must contain the following lines
        assert.ok(containsLineWith(stdout, [
          'Usage:',
          'Options:',
          'Available commands',
          'mj help <command>' 
        ]));
        done();
      });
    });
  });

  describe('help', function (done) {
    it('should return the main --help text if no arguments given', function (done) {
      mjWithArgs('help', function (err, stdout) {
        if (err) throw err;
        assert.equal(strip(loadHelpText('main')), strip(stdout));
        done();
      });
    });
  });
});
