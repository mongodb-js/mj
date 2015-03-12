#!/usr/bin/env node

var docopt = require('docopt').docopt, 
    pkg = require(__dirname + '/package.json'),
    fs = require('fs');

var cli = fs.readFileSync('./docopts/main.docopt', 'utf-8');
var argv = docopt(cli, {version: pkg.version, options_first: true});

// handle "mj help"
if (argv['<command>'] === 'help') {
  if (argv['<args>'].length === 0) {
    // only output main help screen
    console.log(cli);
    process.exit(0);
  } 
}

// pass on to sub parser
var cmd = argv['<command>'];
try {
  cli = fs.readFileSync('./docopts/'+cmd+'.docopt', 'utf-8');
} catch (e) {
  console.error('Unknown command "' + cmd + '". See "mj help" for available commands.')
  process.exit(1);
}
argv = docopt(cli, {version: pkg.version, options_first: false});

// call function with parsed args
require('./commands/'+cmd)(argv);
