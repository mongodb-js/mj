# mj
mongodb-js management and orchestration tool

This is currently an empty shell, only CLI placeholders set up. 

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

