// from mocha source: https://github.com/mochajs/mocha/blob/1eec8be4d0618feb9dca03a28f06ba3af1254f66/lib/reporters/base.js

/**
 * Default symbol map.
 */
module.exports = {
    ok: '✓',
    err: '✖',
    dot: '․'
};

// With node.js on Windows: use symbols available in terminal default fonts
if(process && process.platform === 'win32') {
  module.exports.ok = '\u221A';
  module.exports.err = '\u00D7';
  module.exports.dot = '.';
}