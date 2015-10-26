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
      argv.warn('ci before verify', format('current nodejs (v%s) !== mj\'s (v%s).',
      versions.node, config.nodejs_version));
      argv.ci.verified = false;
    } else {
      argv.ok('ci before verify', format('node v%s', versions.node));
    }

    if (versions.npm !== config.npm_version) {
      argv.warn('ci before verify', format('current npm (v%s) !== mj\'s (v%s).',
      versions.npm, config.npm_version));
      argv.ci.verified = false;
    } else {
      argv.ok('ci before verify', format('npm v%s', versions.npm));
    }
    done();
  });
}

module.exports = verify;
