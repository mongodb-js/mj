var runner = require('mongodb-runner');
var debug = require('debug')('mj:command:ci:after');

module.exports = function(argv, done) {
  argv.ci.mongodb.action = 'stop';
  argv.spinner('Stopping MongoDB');
  runner.stop(argv.ci.mongodb, function() {
    argv.ok('MongoDB stopped');
    debug('Clearing CI timeout...');
    clearTimeout(argv.ci.timeout);
    done();

    /**
     * @todo (imlucas) If we're not in the evergreen
     * compile task, zip up `./node_modules/**`
     * and have evergreen put it on S3.
     * @see mj:command:ci:after
     */
  });
};
