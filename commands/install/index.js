var config = require('../lib/config');
var windows = require('./windows');
var osx = require('./osx');

if (config.PLATFORM === 'windows') {
  module.exports = windows;
} else if (config.PLATFORM === 'osx') {
  module.exports = osx;
}
