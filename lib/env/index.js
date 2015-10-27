/**
 * Platform agnostic API for reading and persisting
 * user level environment variables.
 *
 * @todo (imlucas): Break off as it's own module.
 */
var config = require('../config');
var windows = require('./windows');
var linux = require('./linux');

if (config.platform === 'windows') {
  module.exports = windows;
} else {
  module.exports = linux;
}
