var runner = require('mongodb-runner');
var debug = require('debug')('mj:command:ci:after');

module.exports = function(argv, done) {
  argv.ci.mongodb.action = 'stop';
  argv.spinner('ci: stopping mongodb');
  runner(argv.ci.mongodb, function() {
    argv.ok('ci: stopped mongodb');
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
