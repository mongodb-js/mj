'use strict';

var os = require('os'),
  glob = require('glob'),
  fs = require('fs'),
  run_steps = require('../util/run_steps'),
  symbols = require('../util/symbols'),
  child_process = require('child_process'),
  path = require('path'),
  debug = require('debug')('mj:install');

var sublime_plugins = [
  'Jade',
  'jsfmt',
  'LESS',
  'SublimeLinter',
  'SublimeLinter-jshint',
  'Git'
];

function installSublimePlugins(done) {

  findSublimePkgLocation(function(err, config) {
    if (err) return done(err);

    fs.readFile(config, 'utf8', function(err, content) {
      if (err) return done(err);

      // add packages if not yet installed
      var installedPlugins = [];
      var newContent = JSON.parse(content);

      sublime_plugins.forEach(function(plugin) {
        if (newContent.installed_packages.indexOf(plugin) === -1) {
          installedPlugins.push(plugin);
          newContent.installed_packages.push(plugin);
        }
      });

      // backup only if file was modified
      if (installedPlugins.length > 0) {
        var backup_file = config + '.mj-backup';
        fs.exists(backup_file, function(exists) {
          if (!exists) {
            // create backup copy only if doesn't exist yet
            debug('writing backup file', backup_file);
            fs.writeFileSync(backup_file, content);
          }
        });
      }

      // write modified file back
      fs.writeFile(config, JSON.stringify(newContent, null, '  '), function(err) {
        done(err, installedPlugins);
      });
    });
  });
}

function findSublimePkgLocation(done) {
  var patterns = {
    'darwin': '/Library/Application Support/Sublime Text ?/Packages/User/Package Control.sublime-settings',
    'linux': '/.config/sublime-text-?/Packages/User/Package Control.sublime-settings',
    'windows': '\\AppData\\Roaming\\Sublime Text ?\\Packages\\User\\Package Control.sublime-settings'
  };

  // platform agnostic home path
  var HOME = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;

  // find app base path
  var pattern = patterns[os.platform()];
  if (!pattern) {
    return done(new Error('unknown platform, I can\'t find Sublime here.'));
  }

  glob(path.join(HOME, pattern), function(err, matches) {
    if (err) return done(err);
    if (matches.length === 0) {
      return done(new Error('can\'t find Sublime Text installation.'));
    }
    // for multiple installations, pick the highest one (3)
    var pcs_loc = matches.sort().reverse()[0];
    done(null, pcs_loc);
  });
}

function installJSHintModule(done) {
  // @todo: only install if not yet installed, return status
  child_process.exec('npm install -g jshint', done);
}

module.exports = function(args, done) {

  var tasks = {
    'install jshint module': installJSHintModule
  };
  if (args['--sublime']) {
    tasks['register sublime plugins'] = installSublimePlugins;
  }

  var options = {
    name: 'install',
    verbose: args['--verbose']
  };

  run_steps(tasks, options, function(err, res) {
    if (res['register sublime plugins'] && res['register sublime plugins'].length > 0) {
      console.log(' ', symbols.warn, ' restart Sublime Text to install the new plugins');
    }
    done(err, res);
  });
};
