var chalk = require('chalk');
var figures = require('figures');

// Default symbol map.
module.exports = {
  ok: chalk.green(figures.tick),
  err: chalk.red(figures.cross),
  dot: figures.dot,
  warn: chalk.yellow(figures.warning)
};
