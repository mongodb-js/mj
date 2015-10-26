/**
 * @todo (imlucas) If `fs.exists(process.cwd(), '/.zuul.yml')`, exec
 * zuul w/ --electron + mocha opts above.
 * @todo (imlucas) Istanbul is kind of beefy and hard to use
 * programmatically... Switch to blanket.
 * http://www.asyncdev.net/2013/07/javascript-test-coverage-with-blanket-js/
  * @todo (imlucas): Grab latest api usage from [bin/_mocha] as
  * the wiki page is pretty out of date.
  *
  * [bin/_mocha]: https://github.com/mochajs/mocha/blob/master/bin/_mocha
  */
var Mocha = require('mocha');
var path = require('path');
var glob = require('glob');
var debug = require('debug')('mj:command:ci:run');

module.exports = function(argv, done) {
  var options = {
    ui: 'bdd',
    reporter: require('mocha-evergreen-reporter')
  };

  debug('mocha options', options);

  var mocha = new Mocha(options);
  mocha.useInlineDiffs(true);

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
    // argv.spinner('Running tests');
    // Run the tests.
    try {
      mocha.run();
    } catch (e) {
      done(e);
    }
  });
};
