# mj
mongodb-js management and orchestration tool

This is currently an empty shell, only CLI placeholders set up. 

### Usage

```
Usage:
   mj [--version] [--help] <command> [<args>...]

Options:
   -h, --help     Print this help screen

Available commands are:
   add        Add a repository to the mongodb-js organization
   check      Check if all requirements are met and tests pass
   create     Create a new mongodb-js repository
   ingest     Prepare ingestion of existing repository to mongodb-js
   help       Provide help on any command

See 'mj help <command>' for more information on a specific command.
```


### Add new command

To add the command `foobar`, follow these steps:

1. add `./docopts/foobar.docopt`
2. add `./commands/foobar.js`

`foobar.js` needs to export a function like so: 

```js
module.exports = function (args) {
  ...
}
```

where `args` is the already docopt-parsed result of your `foobar.docopt` definitions. No validation has been performed on args, other than it matched one of the defined docopt definitions.

Your command should exit either with `process.exit(0)` if everything was ok, or `process.exit(1)` if there was an error. 

