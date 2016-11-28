var format = require('util').format;

var common = require('./common');

common.register('echo', _echo, {
  allowGlobbing: false,
});

//@
//@ ### echo([options,] string [, string ...])
//@ Available options:
//@
//@ + `-e`: interpret backslash escapes (default)
//@ + `-n`: remove trailing newline from output
//@
//@ Examples:
//@
//@ ```javascript
//@ echo('hello world');
//@ var str = echo('hello world');
//@ echo('-n', 'no newline at end');
//@ ```
//@
//@ Prints string to stdout, and returns string with additional utility methods
//@ like `.to()`.
function _echo(opts, messages) {
  // allow strings starting with '-', see issue #20
  messages = [].slice.call(arguments, opts ? 0 : 1);

  var option = ['-e', '-n', '-ne', '-en'].indexOf(messages[0]);
  var output;

  if (option >= 0) {
    // ignore options
    messages.shift();
    output = format.apply(null, messages);
    if (option === 0) {
      // add newline if -n is not passed
      output += '\n';
    }
  } else {
    output = format.apply(null, messages) + '\n';
  }

  process.stdout.write(output);

  return output;
}
module.exports = _echo;
