var exec = require('child_process').exec;
var format = require('util').format;
var async = require('async');

module.exports = function(argv, done) {
  var dir = argv['<directory>'];
  var pkg;

  try {
    pkg = require(dir + '/package.json');
  } catch (e) {
    return process.nextTick(done.bind(null, e));
  }

  function run(cmd, fn) {
    exec(cmd, {
      cwd: dir
    }, fn);
  }

  // @todo: add maintainers/collaborators to package.json
  // @todo: update travis URL's in README.md
  // @todo: update repo and hompage in package.json
  // @todo: travis hook
  async.series({
    'add mongodb-js to owners': run.bind(null, format('npm owner add mongodb-js %s', pkg.name))
  }, done);
};
