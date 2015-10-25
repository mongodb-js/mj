var config = require('../lib/config');
var Config = config.Config;
var assert = require('assert');

describe('config', function() {
  it('should work', function() {
    assert(config);
    assert(config.Config);

    assert.equal(config.nodejs_distro, 'io.js');
    assert.equal(config.nodejs_version, '2.3.4');
    assert.equal(config.npm_version, '3.3.8');
    assert.equal(config.nodist_version, '0.6.0');
    assert.equal(config.electron_version, '0.30.8');
  });
  it('should work for windows', function() {
    var c = new Config({
      platform: 'win32'
    });

    // 'C:/.mj/nodist-0.6.0',
    assert(c.nodist_prefix);
    // 'https://github.com/marcelklehr/nodist/archive/v0.6.0.zip',
    assert(c.nodist_url);
    // 'iojsv2.3.4',
    assert(c.nodist_use);
    // 'C:/.mj/nodist-0.6.0/bin'
    assert(c.bin_directory);
    assert.equal(c.nodejs_manager, 'nodist');
    assert.equal(c.arch, 'ia32');
  });
  it('should work for osx', function() {
    var c = new Config({
      platform: 'darwin'
    });

    assert.equal(c.platform, 'osx');
    assert(c.nvm_url);
    assert(c.nvm_use);
    assert.equal(c.arch, 'x64');
    assert.equal(c.nodejs_manager, 'nvm');
  });
  it('should work for linux', function() {
    var c = new Config({
      platform: 'linux'
    });

    assert.equal(c.platform, 'linux');
    assert(c.nvm_url);
    assert(c.nvm_use);
    assert.equal(c.arch, 'x64');
    assert.equal(c.nodejs_manager, 'nvm');
  });
});
