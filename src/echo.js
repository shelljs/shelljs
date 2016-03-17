var common = require('./common');

//@
//@ ### echo(string [, string ...])
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
function _echo(opts, messages) {
  // allow strings starting with '-', see issue #20
  messages = [].slice.call(arguments, opts ? 0 : 1);
  console.log.apply(console, messages);
  return new common.ShellString(messages.join(' '), '', 0);
}
module.exports = _echo;
