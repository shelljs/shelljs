var common = require('./common');

//@
//@ ### echo(string [,string ...])
//@
//@ Examples:
//@
//@ ```javascript
//@ echo('hello world');
//@ var str = echo('hello world');
//@ ```
//@
//@ Prints string to stdout, and returns string with additional utility methods
//@ like `.to()`.
function _echo() {
  var messages = [].slice.call(arguments, 0);

  var opts = { newline: true, 'escape': false };
  for (var i = 0; i < messages.length; i++) {
      if (messages[i] === '-n') {
          opts.newline = false;
          args.splice(i--, 1);
      }
      else if (messages[i] === '-e') {
          opts['escape'] = true;
          messages.splice(i--, 1);
      }
      else if (messages[i] === '-E') {
          opts['escape'] = false;
          messages.splice(i--, 1);
      }
  }

  var result = messages.join(' ');
//  if (opts.newline) result += '\n';

  console.log(result)
  return common.ShellString(result);
}
module.exports = _echo;
