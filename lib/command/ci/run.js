var Mocha = require('mocha');
var path = require('path');
var glob = require('glob');
var debug = require('debug')('mj:command:ci:run');

/**
 * @todo (imlucas) If `fs.exists(process.cwd(), '/.zuul.yml')`, exec
 * zuul w/ --electron + mocha opts above.
 * @todo (imlucas) Istanbul is kind of beefy and hard to use
 * programmatically... Switch to blanket.
 * http://www.asyncdev.net/2013/07/javascript-test-coverage-with-blanket-js/
 */
module.exports = function(argv, done) {
  var mocha = new Mocha({
    ui: 'bdd',
    reporter: 'mocha-evergreen-reporter'
  });

  var testDir = path.join(argv.directory, 'test');

  glob(testDir + '/*.test.js', function(e, files) {
    files.map(function(file) {
      mocha.addFile(path.join(testDir, file));
    });
  });

  // Run the tests.
  mocha.run(function(failures) {
    done(failures);
  });
};
