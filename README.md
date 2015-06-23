# mj

[![Build Status](https://travis-ci.org/mongodb-js/mj.svg?branch=master)](https://travis-ci.org/mongodb-js/mj)

mongodb-js tooling.

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
   help       Provide help on any command
   install    Install development tools for mongodb-js
   create     Create a new mongodb-js project from a template
   check      Check if all requirements are met and tests pass
   submit     Prepare submission of existing project to mongodb-js

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

## Development

### Debugging

To enable debugging, set the `DEBUG` environment variable to `mj*`:

```
DEBUG=mj:* mj check
```

### Adding new commands

To add a new command `foobar`, follow these steps:

1. add interface definition at `./docopts/foobar.docopt`
2. add implemenation at `./commands/foobar.js`
3. add reference to `./docopts/_main.docopt` and `./docopts/help.docopt`

`./commands/foobar.js` needs to export a function like so:

```js
module.exports = function (args, done) {
  // your implementation goes here
}
```

where `args` is the already docopt-parsed result of your `foobar.docopt` definitions, and `done` is the callback function to be called when the command finishes. Note that no validation has been performed on args, other than it matched one of the defined docopt definitions.

Your command should call `done()` if everything was ok, or `done(err)` if there was an error.

### Task Manager

This module comes with a task manager, that uses [async.auto](https://github.com/caolan/async#autotasks-callback) to handle a number of interdependent asynchronous tasks. 

Each task defines zero or more dependencies, that need to be fulfilled first (make sure not to define circular dependencies). Each task also can return any number of results, which are available in the `results` object in dependent tasks. 

The "demo" command shows how this feature can be used. 


## License

Apache 2.0

