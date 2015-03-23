'use strict';

var async = require('async'),
  clui = require('clui'),
  each = require('amp-each'),
  symbols = require('./symbols');

/**
 * executes steps in series (async) and outputs a red error or green checkmarks
 * @param  {object}   tasks     see `async.auto` documentation for tasks definition
 * @param  {object}   options   options object, can contain name, verbose
 * @param  {function} done      callback function(err, res)
 */
module.exports = function(tasks, options, done) {

  // defaults
  options.name = options.name || '';
  options.verbose = !!options.verbose;

  // use spinner only if not --verbose
  var spinner = new clui.Spinner('running ' + options.name + '...');

  if (options.verbose) {
    // wrap all functions to output tickmarks
    each(tasks, function(task, descr) {
      var f = (typeof task === 'function') ? task : task[task.length - 1];
      var wrapped = function(done, results) {
        f(function(err, res) {
          if (err) {
            console.log(' ', symbols.err, ' ' + descr + ' failed:', err.message);
          } else {
            console.log(' ', symbols.ok, ' ' + descr);
          }
          done(err, res);
        }, results);
      };
      if (typeof task === 'function') {
        tasks[descr] = wrapped;
      } else {
        tasks[descr][task.length - 1] = wrapped;
      }
    });
  } else {
    spinner.start();
  }

  async.auto(tasks, function(err, results) {
    if (!options.verbose) {
      spinner.stop();
      if (err) {
        console.log(' ', symbols.err, ' ' + options.name + ' failed:', err.message);
      } else {
        console.log(' ', symbols.ok, ' ' + options.name + ' completed');
      }
    }
    done(err, results);
  });

};
