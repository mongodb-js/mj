'use strict';

var executor = require('../util/executor');

module.exports = function(args, done) {

  /* demos how tasks dependent on each other can easily
   * be implemented using async.auto()'s dependency model.
   *
   * all the tasks here are just simulations with a time delay.
   */
  var tasks = {
    'get some data': function(callback) {
      setTimeout(function() {
        // async code to get some data
        callback(null, 'data', 'converted to array');
      }, 2000);
    },
    'make a folder': function(callback) {
      setTimeout(function() {
        // async code to create a directory to store a file in
        // this is run at the same time as getting the data
        callback(null, 'folder');
      }, 2000);
    },
    'write the file': [
      'get some data', 'make a folder', function(callback) {
        setTimeout(function() {
          // once there is some data and the directory exists,
          // write the data to a file in the directory
          // callback(new Error('don\'t have write permissions')); // simulate an error
          callback(null, 'file written');
        }, 2000);
      }
    ],
    'email the link': [
      'write the file', function(callback, results) {
        setTimeout(function() {
          // once the file is written let's email a link to it...
          // results.write_file contains the filename returned by write_file.
          callback(null, {
            'file': results['write the file'],
            'email': 'user@example.com'
          });
        }, 1000);
      }
    ],
    'print info': [
      'email the link', function(callback, results) {
        console.log(results);
        callback(null, 'done');
      }
    ]
  };

  var options = {
    name: 'create', // this name is used when --verbose is not set
    verbose: args['--verbose'], // set verbosity or pass through from cli
    spinner: true
  };

  executor(tasks, options, done);
};
