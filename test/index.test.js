var mj = require('../'),
    loadDocopt = require('../util/load_docopt'),
    assert = require('assert'),
    exec = require('child_process').exec,
    debug = require('debug')('mj:test');

var BIN_MJ = __dirname + '/../bin/mj.js';

function mjWithArgs(args, callback) {
  // e.g. mjWithArgs("create --type cli")
  exec('node ' + BIN_MJ + ' ' + args, callback);
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

describe('mj module', function() {
  it('should be requireable', function() {
    assert(mj);
  });
});

describe('mj cli', function () {
  describe('--help', function (done) {
    it('should contain help for usage, options, commands, pointer to `mj help`', function (done) {
      mjWithArgs('help', function (err, stdout) {
        if (err) throw err;
        // must contain lines with the following strings
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
        assert.equal(strip(loadDocopt('main')), strip(stdout));
        done();
      });
    });

    it('should output the correct help text when given a command', function (done) {
      var commands = Object.keys(mj);
      commands.forEach(function (cmd) {
        mjWithArgs('help ' + cmd, function (err, stdout) {
          if (err) throw err;
          assert.ok(containsLineWith(stdout, [
            'mj ' + cmd, 
            'Usage:',
            'Options:',
            '-h, --help'
          ]));
          done();
        });
      });
    });
  });


});
