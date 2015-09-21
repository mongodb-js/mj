var _ = require('lodash');
var path = require('path');
var format = require('util').format;
var untildify = require('untildify');
var debug = require('debug')('mongodb-scout-bootstrap:config');

if (process.platform === 'win32') {
  exports.PLATFORM = 'windows';
  exports.ARCH = 'ia32';
} else if (process.platform === 'darwin') {
  exports.PLATFORM = 'osx';
  exports.ARCH = 'x64';
} else {
  throw new Error('Linux is not currently supported.');
}

debug('platform=%s arch=%s', exports.PLATFORM, exports.ARCH);

exports.NODE_DISTRO = 'iojs';
exports.NODE_VERSION = '2.3.4';
exports.NPM_VERSION = '3.3.1';

if (exports.PLATFORM === 'windows') {
  exports.NODIST_VERSION = '0.6.0';
  exports.NODIST_DEST = 'C:\\';
  exports.NODIST_PREFIX = path.join('C:', 'nodist-' + exports.NODIST_VERSION);
  exports.NODIST_URL = format('https://github.com/marcelklehr/nodist/archive/v%s.zip',
    exports.NODIST_VERSION);
  exports.NODIST_USE = format('%sv%s', exports.NODE_DISTRO, exports.NODE_VERSION);
  exports.BIN_DIRECTORY = path.join(exports.NODIST_PREFIX, 'bin');
} else {
  exports.NVM_VERSION = '0.26.1';
  exports.NVM_USE = format('%s-v%s', exports.NODE_DISTRO, exports.NODE_VERSION);
  exports.NVM_URL = format('https://raw.githubusercontent.com/creationix/nvm/v%s/install.sh',
    exports.NVM_VERSION);
  exports.BIN_DIRECTORY = path.join(untildify('~/.nvm/versions/io.js'),
    exports.NODE_VERSION, 'bin');
}

_.each(_.keys(exports), function(name) {
  debug('set environment variable `%s` to `%s`', name, exports[name]);
  process.env[name] = exports[name];
});

module.exports = exports;
