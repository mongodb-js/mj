var mj = require('../'),
  loadDocopt = require('../util/load_docopt'),
  assert = require('assert'),
  async = require('async'),
  exec = require('child_process').exec,
  path = require('path'),
  which = require('which'),
  fs = require('fs'),
  debug = require('debug')('mj:test');

var BIN_MJ = path.resolve(__dirname, '../bin/mj.js');
var NODE = which.sync('node');

assert(fs.existsSync(BIN_MJ), BIN_MJ + ' does not exist');
assert(fs.existsSync(NODE), NODE + ' does not exist');

debug('path to mj bin is %s', BIN_MJ);
debug('path to node bin is %s', NODE);

var run = function(args, done) {
  if (typeof args === 'function') {
    done = args;
    args = '';
  }

  var cmd = '"' + NODE + '" ' + BIN_MJ + ' ' + args;
  debug('running `%s`', cmd);

  exec(cmd, function(err, stdout, stderr) {
    if (err) {
      debug('failed to run `%s`', cmd);
      console.error('exec failed: ', err);
      return done(err);
    }
    debug('completed successfully `%s`', cmd);
    done(null, stdout, stderr);
  });

};


function containsLineWith(text, str) {
  if (!(str instanceof Array)) {
    str = [str];
  }
  var lines = text.split('\n');
  return str.every(function(s) {
    return lines.some(function(l) {
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

describe('mj cli', function() {
  describe('--help', function() {
    it('should contain help for usage, options, commands, pointer to `mj help`', function(done) {
      run('help', function(err, stdout) {
        assert.ifError(err);
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

  describe('help', function() {
    it('should return the main --help text if no arguments given', function(done) {
      run('help', function(err, stdout) {
        assert.ifError(err);
        assert.equal(strip(loadDocopt('main')), strip(stdout));
        done();
      });
    });

    it('should output the correct help text when given a command', function(done) {
      var tasks = Object.keys(mj).map(function(cmd) {
        return function(cb) {
          run('help ' + cmd, function(err, stdout) {
            assert.ifError(err);
            assert.ok(containsLineWith(stdout, [
              'mj ' + cmd,
              'Usage:',
              'Options:',
              '-h, --help'
            ]));
            cb(null, 'ok');
          });
        };
      });
      async.parallel(tasks, done);
    });
  });

  // describe('check', function() {
  //   it('should run successfully on mj itself', function(done) {
  //     // increase timeout for this test
  //     this.timeout(10000);
  //     run('check', function(err, stdout) {
  //       assert.ifError(err);
  //       assert.ok(containsLineWith(stdout, 'check completed'));
  //       done();
  //     });
  //   });
  // });


});
