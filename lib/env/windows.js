/* eslint max-len:0 */
/**
 * @note: You need to manually reload your environment
 * variables in powershell after making changes:
 * ```ps
 * [Environment]::GetEnvironmentVariables('User').GetEnumerator() | % {Set-Item "Env:$($_.Name)" -Value $_.Value;}
 * ```
 */
var Winreg = require('winreg');
var Environment = require('./common');
var debug = require('debug')('env:windows');
module.exports = new Environment({
  set: function(key, value, fn) {
    new Winreg({
      hive: Winreg.HKCU,
      key: '\\Environment'
    }).set(key, Winreg.REG_EXPAND_SZ, value, function(err) {
      if (err) {
        return fn(err);
      }
      debug('set `%s` to `%s`', key, value);
      fn(null, true);
    });
  },
  get: function(key, fn) {
    new Winreg({
      hive: Winreg.HKCU,
      key: '\\Environment'
    }).get(key, function(err, res) {
      if (err) {
        return fn(err);
      }
      fn(null, res.value);
    });
  },
  key: function(name) {
    if (name.toLowerCase() === 'path') {
      return 'Path';
    }
    return name;
  }
});
