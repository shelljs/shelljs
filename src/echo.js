var common = require('./common');

common.register('echo', _echo, {
  allowGlobbing: false,
});

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
  return messages.join(' ');
}
module.exports = _echo;
