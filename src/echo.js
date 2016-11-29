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
  var options = parseEchoOptions(opts);
  var output;

  if (options) {
    // first argument was options string,
    // so do not print it
    messages.shift();
    output = format.apply(null, messages);
    if (!options.n) {
      // add newline if -n is not passed
      output += '\n';
    }
  } else {
    output = format.apply(null, messages) + '\n';
  }

  process.stdout.write(output);

  return output;
}

function parseEchoOptions(opts) {
  var options = {
    'e': true, // escapes, default
    'n': false // no newline
  };
  var c;

  if (typeof opts === 'string') {
    if (opts[0] !== '-') {
      return;
    }

    // e.g. chars = ['R', 'f']
    var chars = opts.slice(1).split('');

    for (var i = 0; i < chars.length; i += 1) {
      c = chars[i];
      if (c in options) {
        options[c] = true;
      } else {
        return;
      }
    }
  } else if (typeof opts === 'object') {
    var keys = Object.keys(opts);

    for (var j = 0; j < keys.length; j += 1) {
      c = keys[j][1];
      if (c in options) {
        options[c] = true;
      } else {
        return;
      }
    }
  }

  return options;
}

module.exports = _echo;
