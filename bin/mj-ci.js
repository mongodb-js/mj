#!/usr/bin/env node

var updateNotifier = require('update-notifier');
var pkg = require('../package.json');
updateNotifier({
  pkg: pkg
}).notify();

var chalk = require('chalk');
var figures = require('figures');
var format = require('util').format;
var clui = require('clui');
var multiline = require('multiline');
var _ = require('lodash');
/**
 * @todo (imlucas): Use https://www.npmjs.com/package/speller
 */
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
var yargs = require('yargs')
  .wrap(120)
  .usage('mj-ci [<command>] [<directory>]')
  .command('before', 'Start MongoDB')
  .command('test', 'Run tests')
  .command('test_', 'Child process used by `test` to execute tests')
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
  .epilogue(multiline(function() { /*
    Environment Variables:
      mongodb.version         MONGODB_VERSION
      mongodb.topology        MONGODB_TOPOLOGY
      mongodb.enterprise      MONGODB_ENTERPRISE
  */
  }));
var argv = yargs.argv;

if (argv.verbose) {
  process.env.DEBUG = '*';
}
var debug = require('debug')('mj-ci');

debug('argv is', JSON.stringify(argv, null, 2));

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
    argv._spinner.start();
  }
  return argv;
};

argv.stopSpinner = function() {
  if (argv._spinner) {
    argv._spinner.stop();
  }
  return argv;
};

function message(icon, command, msg) {
  /* eslint no-console:0 */
  argv.stopSpinner();

  var color = 'white';
  if (icon === figures.tick) {
    color = 'green';
  } else if (icon === figures.warning) {
    color = 'yellow';
  } else if (icon === figures.cross) {
    color = 'red';
  }

  if (!msg) {
    console.log(chalk.bold[color](icon), ' ' + command);
  } else {
    command = command.replace(/ /g, ' ' + figures.pointerSmall + ' ');
    console.log(chalk.bold[color](icon) + ' ', chalk.gray(command), msg);
  }
}

argv.ok = function(command, msg) {
  message(figures.tick, command, msg);
  return argv;
};

argv.warn = function(command, msg) {
  message(figures.warning, command, msg);
  return argv;
};

argv.error = function(title, err) {
  /* eslint no-console:0 */
  argv.stopSpinner();

  if (err) {
    console.error(chalk.red(figures.cross), format(' Error %s', title));
    err.stack.split('\n').map(function(line) {
      console.error(chalk.gray(line));
    });
  } else {
    console.error(chalk.red(figures.cross), title);
  }
  return argv;
};

argv.toString = function() {
  return argv.toArray().join(' ');
};

argv.toArray = function() {
  var res = [];
  var args = _.clone(argv);
  var aliasKeys = _.flatten(_.values(yargs.getOptions().alias || {}));
  res.push.apply(res, args._);
  delete args._;
  _.each(args, function(value, key) {
    if (!_.isString(value)) {
      return;
    }
    if (_.startsWith(key, '$')) {
      return;
    }
    if (_.contains(aliasKeys, key)) {
      return;
    }

    res.push.apply(res, [format('--%s', key), value]);
  });
  return res;
};

// var debug = require('debug')('mj:bin:ci');
var ci = require('../lib/command/ci');


var kill = require('kill-mongodb');
// var running = require('is-mongodb-running');
// var checker = setInterval(function() {
//   running(function() {
//     debug('is mongodb running?', arguments);
//   });
// }, 1000);

var command = argv._[0];
var name = command || 'ci';
command = command || 'default';

if (!ci[command]) {
  argv.warn(format('ci does not seem to have the command `%s`', command));
  yargs.showHelp();
  process.exit(1);
}

// argv.spinner('Running ' + name);
ci[command](argv, function(err) {
  debug('command returned', arguments);
  // clearInterval(checker);
  debug('calling kill-mongodb');
  kill(function() {
    debug('kill-mongodb returned', arguments);
    if (err) {
      argv.error('ci: ' + err.message, err);
      process.exit(1);
    }
    argv.ok(name + ': complete');
    process.exit(0);
  });
});
