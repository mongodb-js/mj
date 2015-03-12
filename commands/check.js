var fs = require('fs'),
    glob = require('glob').sync;

function test_docs(args) {
  if (args['--skip-docs']) {
    return 'skipped';
  }
  
  // check if non-empty README.* exists or a non-empty ./docs folder
  var readme = glob(args['<directory>'] + '/README.*');

  if (readme.length > 0) {
    // @todo: check if non-empty
    return true;
  }

  // no readme. is there a non-empty ./docs directory?
  var docs = glob(args['<directory>'] + '/docs/*');
  return (docs.length > 0);
}


module.exports = function (args) {
  args['<directory>'] = args['<directory>'] || '.';
  
  var results = {
    docs: test_docs(args)
  };

  // @todo return true/false based on results
  console.log(results);
}