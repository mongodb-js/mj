/**
 * @todo (imlucas): read and write from ~/.profile?
 * is this the correct file?
 * @todo (imlucas): The installer we deliver for this on linux
 * should be a bash file so we can update the current shell
 * env variables smoothly.
 */
var Environment = require('./common');
module.exports = new Environment({
  set: function(key, value, fn) {
    return fn(new Error('Not implemented'));
  },
  get: function(key, fn) {
    return fn(new Error('Not implemented'));
  },
  key: function(name) {
    if (name.toLowerCase() === 'path') {
      return 'PATH';
    }
    return name;
  }
});
