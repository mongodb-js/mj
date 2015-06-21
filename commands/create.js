'use strict';

var debug = require('debug')('mj:create');
var format = require('util').format;
var Khaos = require('khaos');
var path = require('path');
var fs = require('fs');

var executor = require('../util/executor');

var TEMPLATES = ['empty', /* 'cli', 'view', 'spa', 'full', 'util', 'doc' */];

module.exports = function(args, done) {

  var tasks = {
    /**
     * make sure the template exists.
     */

    'template': function (callback) {
      if (TEMPLATES.indexOf(args['<template>']) === -1) {
        return callback(new Error(format('Unknown template "%s". Run `mj help create` for list of valid templates.', args['<template>'])));
      }
      var khaos = new Khaos(path.join(__dirname, '../templates/', args['<template>']));

      // return khaos instance in results
      return callback(null, khaos);
    },

    /**
     * before copying, make sure the target directory is empty or does not exist.
     */
    'destination': function(callback) {
      fs.readdir(args['<directory>'], function (err, files) {
        // error here means it does not exist, which is good.
        if (err) return callback(null, args['<directory>']);
        if ((files.length) > 0) return callback(new Error(format('destination directory %s is not empty.', path.resolve(args['<directory>']))));
        return callback(null, args['<directory>']);
      });
    },

    /**
     * now copy template to destination with khaos, prompt for handlebar variables
     */
    'copy': [
      'template',
      'destination',
      function(callback, results) {
        var khaos = results.template;
        khaos.generate(results.destination, callback);
      }
    ]
  };

  var options = {
    name: 'create',  // this name is used when --verbose is not set
    verbose: args['--verbose'],  // set verbosity or pass through from cli
    spinner: false, // turn off spinner because of khaos prompts
    success: format('new project with template "%s" created.', args['<template>'])
  };

  executor(tasks, options, done);
};
