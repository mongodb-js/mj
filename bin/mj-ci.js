#!/usr/bin/env node
var chalk = require('chalk');
var figures = require('figures');
var format = require('util').format;
var clui = require('clui');
var multiline = require('multiline');

/**
 * How to use `yargs` like a Wizzard:
 * - https://github.com/bcoe/yargs
 * - http://reverentgeek.com/ahoy-parse-ye-node-js-command-args-with-yargs/
 * - http://blog.nodejitsu.com/npmawesome-parsing-command-line-options-with-yargs/
 */

/**
 * @todo (imlucas): Use `.completion()`
 * https://www.npmjs.com/package/yargs#completion-cmd-description-fn
 */
var argv = require('yargs')
  .wrap(120)
  .usage('mj-ci [<command>] [<directory>]')
  .command('before', 'Start MongoDB')
  .command('run', 'Run tests')
  .command('after', 'Stop MongoDB')
  .command('', 'before & run & after')
  .option('directory', {
    alias: 'dir',
    description: 'Project working directory',
    default: process.cwd(),
    type: 'string'
  })
  .option('mongodb.version', {
    description: 'MongoDB version',
    default: process.env.MONGODB_VERSION || 'stable',
    type: 'string'
  })
  .option('mongodb.enterprise', {
    description: 'Use MongoDB enterprise',
    default: Boolean(process.env.MONGODB_ENTERPRISE || false),
    type: 'boolean'
  })
  .option('mongodb.topology', {
    description: 'MongoDB topology',
    choices: ['standalone', 'replicaset', 'cluster'],
    default: process.env.MONGODB_TOPOLOGY || 'standalone',
    type: 'string'
  })
  .option('verbose', {
    alias: 'vvv',
    description: 'Enable verbose logging',
    default: false,
    type: 'boolean'
  })
  .option('dry-run', {
    description: 'Just print things out for testing but dont run things',
    default: false,
    type: 'boolean'
  })
  .example('$0', 'Run the tests.')
  .help('help').alias('h', 'help')
  .epilogue(multiline(function() {/*
    Environment Variables:
      mongodb.version         MONGODB_VERSION
      mongodb.topology        MONGODB_TOPOLOGY
      mongodb.enterprise      MONGODB_ENTERPRISE
  */
  }))
  .argv;

if (argv.verbose) {
  process.env.DEBUG = '*';
}

argv._spinner = null;
argv.spinner = function(msg) {
  if (process.env.CI) {
    // Don't show spinner's when running in CI
    // as it makes the build log utterly useless...
    console.log(format('%s%s', msg, figures.ellipsis));
  } else {
    if (argv._spinner) {
      argv._spinner.stop();
    }
    argv._spinner = new clui.Spinner(format('%s%s', msg, figures.ellipsis));
  }
  return argv;
};

argv.stopSpinner = function() {
  if (argv._spinner) {
    argv._spinner.stop();
  }
  return argv;
};

argv.ok = function(msg) {
  /* eslint no-console:0 */
  argv.stopSpinner();
  console.log(chalk.green(figures.tick), ' ' + msg);
  return argv;
};

argv.error = function(title, err) {
  /* eslint no-console:0 */
  argv.stopSpinner();

  console.error(chalk.red(figures.cross), format(' Error %s', title));
  err.stack.split('\n').map(function(line) {
    console.error(chalk.gray(line));
  });
  return argv;
};

// var debug = require('debug')('mj:bin:ci');
var ci = require('../lib/command/ci');

var command = argv._[0];
var name = command || 'ci';
command = command || 'default';

argv.spinner('Running ' + name);
ci[command](argv, function(err, res) {
  if (err) {
    argv.error('ci', err);
    process.exit(1);
  }
  argv.ok(name + ' complete')
  console.log('res', res);
  process.exit(0);
});
