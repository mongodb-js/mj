var Mocha = require('mocha');
var path = require('path');
var glob = require('glob');
var format = require('util').format;
var debug = require('debug')('mj:command:ci:run');

/**
 * @todo (imlucas) If `fs.exists(process.cwd(), '/.zuul.yml')`, exec
 * zuul w/ --electron + mocha opts above.
 * @todo (imlucas) Istanbul is kind of beefy and hard to use
 * programmatically... Switch to blanket.
 * http://www.asyncdev.net/2013/07/javascript-test-coverage-with-blanket-js/
 */
module.exports = function(argv, done) {
  var options = {
    ui: 'bdd'
    // reporter: 'mocha-evergreen-reporter'
  };

  debug('mocha options', options);

  var mocha = new Mocha(options);

  var testDir = path.join(argv.directory, 'test');
  debug('collecting tests from `%s`', testDir + '/*.test.js');

  glob('*.test.js', {cwd: testDir}, function(err, files) {
    if (err) {
      done(err);
      return;
    }
    if (files.length === 0) {
      done(new Error('No .test.js files found under ' + testDir));
      return;
    }

    files.map(function(file) {
      debug('adding `%s` to test suite', file);
      mocha.addFile(path.join(testDir, file));
    });
    argv.spinner('Running tests');
    // Run the tests.
    mocha.run(function(failures) {
      argv.ci.failed = failures > 0;
      if (argv.ci.failed) {
        argv.error(format('%d tests failed', failures));
      }
      done();
    });
  });
};
