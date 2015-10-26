var runner = require('mongodb-runner');
var debug = require('debug')('mj:command:ci:after');

module.exports = function(argv, done) {
  argv.spinner('ci after');
  runner.stop(argv.mongodb, function() {
    argv.ok('ci mongodb stop');
    debug('Clearing CI timeout...');
    clearTimeout(argv.ci._timeout);
    done();

    /**
     * @todo (imlucas) If we're not in the evergreen
     * compile task, zip up `./node_modules/**`
     * and have evergreen put it on S3.
     * @see mj:command:ci:after
     */
  });
};
