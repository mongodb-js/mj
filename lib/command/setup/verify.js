var format = require('util').format;
var config = require('../../config');
var run = require('../../run');
var debug = require('debug')('mj:command:ci');

function verify(argv, done) {
  debug('verifying current environment meets requirements...');
  run('npm', ['version', '--json'], function(err, stdout) {
    if (err) return done(err);

    var versions = JSON.parse(stdout);

    if (versions.node !== config.nodejs_version) {
      argv.warn(format('Environment node v%s does not match mj\'s v%s. Warranty voided.',
      versions.node, config.nodejs_version));
    } else {
      argv.ok(format('Environment node v%s', versions.node));
    }

    if (versions.npm !== config.npm_version) {
      argv.warn(format('Environment npm v%s does not match mj\'s v%s. Warranty voided.',
      versions.node, config.npm_version));
    } else {
      argv.ok(format('Environment npm v%s', versions.npm));
    }
    done();
  });
}

module.exports = verify;
