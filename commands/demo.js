'use strict';

var run_steps = require('../util/run_steps');

module.exports = function(args, done) {

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
          callback(new Error('don\'t have write permissions')); // simulate an error
          // callback(null, 'file written');
        }, 2000);
      }
    ],
    'email the link': [
      'write the file', function(callback, results) {
        setTimeout(function() {
          // once the file is written let's email a link to it...
          // results.write_file contains the filename returned by write_file.
          callback(null, {
            'file': results.write_file,
            'email': 'user@example.com'
          });
        });
      }
    ]
  };

  var options = {
    name: 'create',
    verbose: args['--verbose']
  };

  run_steps(tasks, options, done);
};
