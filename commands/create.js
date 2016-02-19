var format = require('util').format;
var Khaos = require('khaos');
var path = require('path-extra');
var fs = require('fs');
var exists = fs.existsSync;
var _ = require('lodash');
var shell = require('shelljs');
var taskmgr = require('../lib/taskmgr');
var which = require('which');
var download = require('download-github-repo');

// Template dependency tree
var templateDependencies = {
  base: null,
  cli: 'base',
  react: 'base'
};

var templateNameToRepo = {
  base: 'mongodb-js/khaos-node',
  cli: 'mongodb-js/khaos-cli',
  react: 'mongodb-js/khaos-react'
};

module.exports = function(args, done) {
  var tasks = {
    // make sure the template exists.
    template: function(callback) {
      if (Object.keys(templateDependencies).indexOf(args['<template>']) === -1) {
        return callback(new Error(format('Unknown template "%s". Run '
          + '`mj help create` for list of valid templates.', args['<template>'])));
      }
      return callback(null);
    },
    // before copying, make sure the target directory is empty or does not exist.
    destination: function(callback) {
      fs.readdir(args['<directory>'], function(err, files) {
        // error here means it does not exist, which is good.
        if (err || args['--force']) {
          return callback(null, args['<directory>']);
        }
        if (files.length > 0) {
          return callback(new Error(format('destination '
            + 'directory %s is not empty.', path.resolve(args['<directory>']))));
        }
        return callback(null, args['<directory>']);
      });
    },
    // after templates are copied, run git init, add, commit and npm install
    git: function(callback) {
      which('git', callback);
    },
    npm: function(callback) {
      which('npm', callback);
    },
    'git init': [
      'git', 'destination', args['<template>'], function(callback, results) {
        shell.cd(results.destination);
        shell.exec('git init .', {
          silent: true,
          async: true
        }, callback);
      }
    ],
    'git add': [
      'git', 'git init', function(callback) {
        shell.exec('git add .', {
          silent: true,
          async: true
        }, callback);
      }
    ],
    'git commit': [
      'git', 'git add', function(callback) {
        shell.exec('git commit -a -m "initial commit"', {
          silent: true,
          async: true
        }, callback);
      }
    ],
    'npm install': [
      'npm', 'git commit', function(callback) {
        shell.exec('npm install', {
          silent: true,
          async: true
        }, callback);
      }
    ]
  };

  // add khaos tasks for each template in the dependency tree
  var generateTemplate = function(template, parent) {
    var templateLocation;
    if (templateNameToRepo[template].startsWith('file://')) {
      templateLocation = templateNameToRepo[template].slice(7);
    } else {
      templateLocation = path.join(path.homedir(), '.mj', 'templates', template);
    }
    return function(callback, results) {
      var processTemplate = function(location, cb) {
        var khaos = new Khaos(path.join(templateLocation, 'template'));
        khaos.read(function(err, files) {
          if (err) return cb(err);
          khaos.parse(files, function(err2, schema) {
            if (err2) return cb(err2);

            // only prompt for new variables
            var newVars = _.omit(schema, _.keys(results[parent] || args.answers));
            khaos.prompt(newVars, function(err3, answers) {
              if (err3) return cb(err3);

              // merge new answers with existing ones and pass to next template
              answers = _.merge(answers, results[parent] || args.answers || {});
              khaos.write(results.destination, files, answers, function(err4) {
                cb(err4, answers);
              });
            });
          });
        });
      };

      // download from github if not yet locally cached
      if (!exists(templateLocation)) {
        download(templateNameToRepo[template], templateLocation, function(err) {
          if (err) return callback(err);
          processTemplate(templateLocation, callback);
        });
      } else {
        processTemplate(templateLocation, callback);
      }
    };
  };

  var curr = args['<template>'];
  while (curr) {
    var parent = templateDependencies[curr];
    // non-root depends on parent template, root on 'template' and 'destination'
    tasks[curr] = parent ?
      [parent, generateTemplate(curr, parent)] :
      ['template', 'destination', generateTemplate(curr, parent)];
    curr = parent;
  }

  var options = _.defaults(args.options || {}, {
    name: 'create', // this name is used when --verbose is not set
    verbose: args['--verbose'], // set verbosity or pass through from cli
    spinner: false, // turn off spinner because of khaos prompts
    success: format('new project with template "%s" created.', args['<template>'])
  });

  taskmgr(tasks, options, done);
};
