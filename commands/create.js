'use strict';

var debug = require('debug')('mj:create');
var format = require('util').format;
var Khaos = require('khaos');
var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var inspect = require('util').inspect;
var executor = require('../util/executor');

// Template dependency tree
var templateDeps = {
  empty: null,
  cli: 'empty',
  view: 'empty',
  util: 'empty',
  doc: 'empty',
  spa: 'view',
  full: 'spa'
};


var answerPlugin = function(answers) {
  return function drafts(files, metalsmith, done) {
    _.assign(answers, metalsmith._metadata);
    done();
  };
};

module.exports = function(args, done) {

  var tasks = {
    /**
     * make sure the template exists.
     */
    'template': function(callback) {
      if (Object.keys(templateDeps).indexOf(args['<template>']) === -1) {
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
    }
  };

  // add khaos.generate tasks for each template in the dependency tree
  var generateTemplate = function(template, parent) {
    return function(callback, results) {
      var answers = {};
      var khaos = new Khaos(path.join(__dirname, '../templates/', template))
        .after(answerPlugin(answers));
      khaos.generate(results.destination, parent ? results[parent] : null, function(err) {
        callback(err, answers);
      });
    };
  };
  var curr = args['<template>'];
  while (curr) {
    var parent = templateDeps[curr];
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
