/* eslint camelcase:0 */
var config = require('../../config');

var series = require('run-series');
var partial = require('lodash').partial;
var untildify = require('untildify');
var format = require('util').format;

var run = require('../../run');
var npm = require('../../npm');
var debug = require('debug')('mj:install:osx');

// @todo (imlucas): MANPATH="$HOME/.node/share/man:$MANPATH"
function install_node(fn) {
  debug('installing node with nvm...');
  var script = [
    format('(curl -o- %s | bash)', config.nvm_url),
    format('source %s', untildify('~/.nvm/nvm.sh')),
    format('nvm install %s-v%s', config.nvm_use)
  ].join(' && ');
  run('bash', ['-c', script], fn);
}

module.exports = function(opts, done) {
  series([
    install_node,
    npm.configure,
    partial(npm.install, 'npm', config.npm_version),
    npm.installNodeGyp
  ], done);
};
