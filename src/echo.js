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
function _echo(opts) {
  // allow strings starting with '-', see issue #20
  var messages = [].slice.call(arguments, opts ? 0 : 1);
  var options;
  var output;

  // If the first argument starts with '-',
  // parse it as options string.
  // If parseOptions throws,
  // it wasn't an options string.
  if (opts[0] === '-') {
    try {
      options = common.parseOptions(opts, {
        'e': 'escapes',
        'n': 'no_newline'
      }, {
        silent: true
      });
    } catch (_) {}
  }

  if (options) {
    // first argument was options string,
    // so do not print it
    messages.shift();
    output = format.apply(null, messages);
    if (!options.no_newline) {
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
