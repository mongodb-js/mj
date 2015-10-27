var config = require('../../config');
var windows = require('./windows');
var osx = require('./osx');

if (config.platform === 'windows') {
  module.exports = windows;
} else {
  module.exports = osx;
}

module.exports.verify = require('./verify');
