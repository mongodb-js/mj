'use strict';

var os = require('os'),
  glob = require('glob'),
  fs = require('fs'),
  run_steps = require('../util/run_steps'),
  symbols = require('../util/symbols'),
  child_process = require('child_process'),
  path = require('path'),
  _ = require('lodash'),
  debug = require('debug')('mj:install');

var sublime_plugins = [
  'Jade',
  'jsfmt',
  'LESS',
  'SublimeLinter',
  'SublimeLinter-jshint',
  'Git'
];

function findSublimeUsrLocation(suffix, done) {
  var patterns = {
    'darwin': function() {
      return path.join(process.env.HOME, '/Library/Application Support/Sublime Text ?/Packages/User/');
    },
    'linux': function() {
      return path.join(process.env.HOME, '/.config/sublime-text-?/Packages/User/');
    },
    'win32': function() {
      return path.join(process.env.APPDATA, '\\AppData\\Roaming\\Sublime Text ?\\Packages\\User\\');
    }
  };

  // find app base path
  var pattern = path.join(patterns[os.platform()](), suffix);
  if (!pattern) {
    return done(new Error('unknown platform, I can\'t find Sublime here.'));
  }

  glob(pattern, function(err, matches) {
    if (err) return done(err);
    if (matches.length === 0) {
      return done(new Error('can\'t find Sublime Text installation.'));
    }
    // for multiple installations, pick the highest one (3)
    var pcs_loc = matches.sort().reverse()[0];
    done(null, pcs_loc);
  });
}

function hideSublimeDotFiles(done) {

  findSublimeUsrLocation('Preferences.sublime-settings', function(err, config) {
    if (err) return done(err);

    fs.readFile(config, 'utf8', function(err, content) {
      if (err) return done(err);

      var newContent = JSON.parse(content);
      var modified = false;

      if (!_.has(newContent, 'file_exclude_patterns')) {
        newContent.file_exclude_patterns = ['.*'];
        modified = true;
      } else {
        if (newContent.file_exclude_patterns.indexOf('.*') === -1) {
          newContent.file_exclude_patterns.push('.*');
          modified = true;
        }
      }

      if (modified) {
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
        done(err, modified);
      });
    });
  });
}

function registerSublimePlugins(done) {

  findSublimeUsrLocation('Package Control.sublime-settings', function(err, config) {
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

function installJSHintModule(done) {
  // @todo: only install if not yet installed, return status
  child_process.exec('npm install -g jshint', done);
}

module.exports = function(args, done) {

  var tasks = {
    'install jshint module': installJSHintModule
  };
  if (args['--sublime']) {
    tasks['register sublime plugins'] = registerSublimePlugins;
    tasks['hide dot files in sublime'] = hideSublimeDotFiles;
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
