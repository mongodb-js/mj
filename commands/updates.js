// Check for dependency updates,
// apply and install them, run tests
// and if still green, push an "Update dependencies"
// commit that should be auto-published.
var ncu = require('npm-check-updates');
var series = require('async').series;
var del = require('del');
var path = require('path');

module.exports = function(args, done) {
  var dir = path.resolve(args['<directory>']);
  ncu.run({
    packageFile: path.resolve(dir, 'package.json'),
    upgrade: true
  }).then(function(upgraded) {
    console.log('upgraded packages', upgraded);

  });
};
