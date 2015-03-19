'use strict';

var async = require('async'),
  clui = require('clui'),
  clic = require('cli-color'),
  symbols = require('./symbols');

/**
 * executes steps in series (async) and outputs a red error or green checkmarks
 * @param  {object}   tasks   tasks is an object that maps description strings to functions
 * @param  {object}   options options object, can contain name, verbose
 * @param  {function} done    callback function(err, res)
 */
module.exports = function(tasks, options, done) {

  // defaults
  options.name = options.name || '';
  options.verbose = !!options.verbose;

  var spinner = new clui.Spinner('running ' + options.name + '...');
  spinner.start();

  async.series(tasks, function(err, res) {
    spinner.stop();
    if (err) {
      console.log(' ', clic.red(symbols.err), ' ' + options.name + ' failed:', err.message);
      return done(err);
    }
    if (options.verbose) {
      Object.keys(res).forEach(function(step) {
        console.log(' ', clic.green(symbols.ok), step);
      });
    } else {
      console.log(' ', clic.green(symbols.ok), ' ' + options.name + ' ok');
    }
    return done(null, res);
  });
};
