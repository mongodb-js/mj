var mj = require('../');
var loadDocopt = require('../lib/load_docopt');
var assert = require('assert');
var async = require('async');
var exec = require('child_process').exec;
var path = require('path');
var which = require('which');
var fs = require('fs');
var debug = require('debug')('mj:test');
var format = require('util').format;
var rimraf = require('rimraf');
var createCmd = require('../commands/create');

var BIN_PATH = path.resolve(__dirname, '../bin/mj.js');
var TEST_DIR = path.resolve(__dirname);
var NODE = which.sync('node');
var COMMANDS = fs.readdirSync(path.join(__dirname, '../commands/')).map(function(cmd) {
  return cmd.replace('.js', '');
});

assert(fs.existsSync(BIN_PATH), BIN_PATH + ' does not exist');
assert(fs.existsSync(NODE), NODE + ' does not exist');

debug('path to bin is %s', BIN_PATH);
debug('path to node bin is %s', NODE);

var run = function(args, done) {
  if (typeof args === 'function') {
    done = args;
    args = '';
  }

  var cmd = '"' + NODE + '" ' + BIN_PATH + ' ' + args;
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

function makeNonEmptyDir(testDir, callback) {
  fs.mkdir(testDir, function(err) {
    assert.ifError(err);
    var dummyfile = path.join(testDir, 'dummy_file.txt');
    fs.closeSync(fs.openSync(dummyfile, 'w'));
    assert.ok(fs.existsSync(dummyfile));
    callback(err);
  });
}


describe('mj module', function() {
  it('should import correctly', function() {
    assert.ok(mj);
  });
});

describe('mj help', function() {
  describe('--help', function() {
    it('should contain help for usage, options, commands, pointer to `mj help`', function(done) {
      run('--help', function(err, stdout) {
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
    it('should return the main help text if no arguments given', function(done) {
      run('help', function(err, stdout) {
        assert.ifError(err);
        assert.equal(strip(loadDocopt('_main')), strip(stdout));
        done();
      });
    });

    it('should output the correct help text when given a command', function(done) {
      var tasks = COMMANDS.map(function(cmd) {
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
});

describe('mj create', function() {
  this.timeout(15000);

  var testDir = path.join(TEST_DIR, 'test_module/');

  afterEach(function(done) {
    rimraf(testDir, done);
  });

  it('should reject non-existing templates', function(done) {
    run('create foo ./bar', function(err, stdout) {
      // assert.ifError(err);
      assert.ok(containsLineWith(stdout,
        'create failed: Unknown template "foo".'
      ));
      done();
    });
  });

  it('should not create new project in existing, non-empty directory', function(done) {
    // make directory
    makeNonEmptyDir(testDir, function(err) {
      assert.ifError(err);
      run('create empty ' + testDir, function(err, stdout) {
        assert.ok(containsLineWith(stdout,
          format('create failed: destination directory %s is not empty.', path.resolve(testDir))
        ));
        done();
      });
    });
  });

  it('should create new project in existing, non-empty directory with --force', function(done) {
    // make directory
    makeNonEmptyDir(testDir, function(err) {
      // fixture for create command args
      var args = {
        '<directory>': testDir,
        '<template>': 'empty',
        '--force': true,
        options: {
          quiet: true
        },
        answers: {
          name: 'testName',
          description: 'testDescription'
        }
      };

      createCmd(args, function(err) {
        assert.ifError(err);
        assert.ok(fs.existsSync(path.join(testDir, 'package.json')));
        done();
      });
    });
  });

  it('should copy the template files', function(done) {
    // fixture for create command args
    var args = {
      '<directory>': testDir,
      '<template>': 'empty',
      options: {
        quiet: true
      },
      answers: {
        name: 'testName',
        description: 'testDescription'
      }
    };

    createCmd(args, function(err) {
      assert.ifError(err);
      assert.ok(fs.existsSync(path.join(testDir, 'package.json')));
      done();
    });
  });
});




