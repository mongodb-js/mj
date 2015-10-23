var config = require('../lib/config');

var series = require('run-series');
var partial = require('lodash').partial;
var untildify = require('untildify');
var format = require('util').format;

var run = require('../lib/run');
var npm = require('../lib/npm');
var debug = require('debug')('mj:install:osx');

// @todo (imlucas): MANPATH="$HOME/.node/share/man:$MANPATH"
function install_node(fn) {
  debug('installing node with nvm...');
  var script = [
    format('(curl -o- %s | bash)', config.NVM_URL),
    format('source %s', untildify('~/.nvm/nvm.sh')),
    format('nvm install %s-v%s', config.NODE_DISTRO, config.NODE_VERSION)
  ].join(' && ');
  run('bash', ['-c', script], fn);
}

module.exports = function(opts, done) {
  series([
    install_node,
    npm.configure,
    partial(npm.install, 'npm', config.NPM_VERSION),
    npm.installNodeGyp
  ], done);
};
