# mj

[![Build Status](https://travis-ci.org/mongodb-js/mj.svg?branch=master)](https://travis-ci.org/mongodb-js/mj)

WIP: mongodb-js tooling.

## Usage

```
mongodb-js tooling.

Usage:
   mj <command> [<args>...]
   mj --version
   mj -h | --help

Options:
   -h, --help     Print this help screen

Available commands are:
   check      Check if all requirements are met and tests pass
   create     Create a new mongodb-js repository
   ingest     Prepare ingestion of existing repository to mongodb-js
   help       Provide help on any command

See 'mj help <command>' for more information on a specific command.
```

## Installation

```
npm install -g mj
```

## Testing

```
npm test
```

## Dev

### Debugging

To enable debugging, set the `DEBUG` environment variable to `mj*`:

```
DEBUG=mj* mj check
```

### Adding commands

To add the command `foobar`, follow these steps:

1. add `./docopts/foobar.docopt`
2. add `./commands/foobar.js`

`foobar.js` needs to export a function like so:

```js
module.exports = function (args, done) {
  ...
}
```

where `args` is the already docopt-parsed result of your `foobar.docopt` definitions, and `done` is the callback function to be called when the command finishes. Note that no validation has been performed on args, other than it matched one of the defined docopt definitions.

Your command should exit either with `process.exit(0)` if everything was ok, or `process.exit(1)` if there was an error.

## License

MIT
