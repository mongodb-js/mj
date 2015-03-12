var fs = require('fs');

module.exports = function (args) {
  var cmd = args['<command>'];
  try {
    cli = fs.readFileSync('./docopts/'+cmd+'.docopt', 'utf-8');
    console.log(cli);
    process.exit(0);
  } catch (e) {
    console.error('Unknown command "' + cmd + '". See "mj help" for available commands.')
    process.exit(1);
  }
}