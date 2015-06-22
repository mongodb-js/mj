'use strict';

var debug = require('debug')('mj:create');
var format = require('util').format;
var Khaos = require('khaos');
var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var shell = require('shelljs');
var executor = require('../util/executor');
var which = require('which');

// Template dependency tree
var templateDependencies = {
  empty: null,
  cli: 'empty',
  view: 'empty',
  util: 'empty',
  doc: 'empty',
  spa: 'view',
  full: 'spa'
};

module.exports = function(args, done) {

  var tasks = {
    /**
     * make sure the template exists.
     */
    'template': function(callback) {
      if (Object.keys(templateDependencies).indexOf(args['<template>']) === -1) {
        return callback(new Error(format('Unknown template "%s". Run ' +
          '`mj help create` for list of valid templates.', args['<template>'])));
      }
      return callback(null);
    },

    /**
     * before copying, make sure the target directory is empty or does not exist.
     */
    'destination': function(callback) {
      fs.readdir(args['<directory>'], function(err, files) {
        // error here means it does not exist, which is good.
        if (err) return callback(null, args['<directory>']);
        if ((files.length) > 0) return callback(new Error(format('destination ' +
            'directory %s is not empty.', path.resolve(args['<directory>']))));
        return callback(null, args['<directory>']);
      });
    },

    /**
     * after templates are copied, run git init, add, commit and npm install
     */
    'git': function(callback) {
      which('git', callback);
    },
    'npm': function(callback) {
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
    return function(callback, results) {
      var khaos = new Khaos(path.join(__dirname, '../templates/', template));
      khaos.read(function(err, files) {
        khaos.parse(files, function(err, schema) {
          // only prompt for new variables
          var newVars = _.omit(schema, _.keys(results[parent]));
          khaos.prompt(newVars, function(err, answers) {
            // merge new answers with existing ones and pass to next template
            answers = _.merge(answers, results[parent] || {});
            khaos.write(results.destination, files, answers, function(err) {
              callback(err, answers);
            });
          });
        });
      });
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

  var options = {
    name: 'create', // this name is used when --verbose is not set
    verbose: args['--verbose'], // set verbosity or pass through from cli
    spinner: false, // turn off spinner because of khaos prompts
    success: format('new project with template "%s" created.', args['<template>'])
  };

  executor(tasks, options, done);
};
