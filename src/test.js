var fs = require('fs');
var common = require('./common');

var cmdOptions = {
  'b': 'block',
  'c': 'character',
  'd': 'directory',
  'e': 'exists',
  'f': 'file',
  'L': 'link',
  'p': 'pipe',
  'S': 'socket',
  'n': 'nonzero',
  'z': 'zero',
};

common.register('test', _test, {
  cmdOptions: null, // We'll handle parsing manually
  wrapOutput: false,
  allowGlobbing: false,
  unix: false, // Bypass the unix-style argument processing
});


//@
//@ ### test(expression)
//@
//@ Available expression primaries:
//@
//@ + `'-b', 'path'`: true if path is a block device
//@ + `'-c', 'path'`: true if path is a character device
//@ + `'-d', 'path'`: true if path is a directory
//@ + `'-e', 'path'`: true if path exists
//@ + `'-f', 'path'`: true if path is a regular file
//@ + `'-L', 'path'`: true if path is a symbolic link
//@ + `'-p', 'path'`: true if path is a pipe (FIFO)
//@ + `'-S', 'path'`: true if path is a socket
//@
//@ String expression primaries:
//@
//@ + `'-n', 'string'`: true if string length is non-zero
//@ + `'-z', 'string'`: true if string length is zero
//@ + `'string1', '=', 'string2'`: true if the strings are equal
//@ + `'string1', '!=', 'string2'`: true if the strings are not equal
//@
//@ Examples:
//@
//@ ```javascript
//@ if (test('-d', path)) { /* do something with dir */ };
//@ if (!test('-f', path)) continue; // skip if it's not a regular file
//@ if (test(process.env.NODE_ENV, '=', 'production')) { /* production mode */ };
//@ if (test('-n', process.env.API_KEY)) { /* API key is set */ };
//@ ```
//@
//@ Evaluates `expression` using the available primaries and returns
//@ corresponding boolean value.
function _test(arg1, arg2, arg3) {
  // Detect string comparison: test(str1, '=', str2) or test(str1, '!=', str2)
  if (arguments.length === 3 && typeof arg1 === 'string' && typeof arg2 === 'string' && typeof arg3 === 'string') {
    if (arg2 === '=') {
      return arg1 === arg3;
    } else if (arg2 === '!=') {
      return arg1 !== arg3;
    }
    common.error('could not interpret expression');
    return false;
  }

  // Detect option-based tests (file tests or string length tests)
  if (arguments.length >= 2 && typeof arg1 === 'string' && arg1[0] === '-') {
    var options;
    try {
      options = common.parseOptions(arg1, cmdOptions);
    } catch (e) {
      common.error('could not interpret expression');
      return false;
    }

    // Handle unary string tests: test('-n', str) or test('-z', str)
    if (options.nonzero) {
      if (typeof arg2 !== 'string') {
        common.error('invalid argument for -n');
        return false;
      }
      return arg2.length > 0;
    }

    if (options.zero) {
      if (typeof arg2 !== 'string') {
        common.error('invalid argument for -z');
        return false;
      }
      return arg2.length === 0;
    }

    // Handle file system tests (existing behavior)
    var path = arg2;
    if (!path) {
      common.error('no path given');
      return false;
    }

    if (options.link) {
      try {
        return common.statNoFollowLinks(path).isSymbolicLink();
      } catch (e) {
        return false;
      }
    }

    if (!fs.existsSync(path)) return false;

    if (options.exists) return true;

    var stats = common.statFollowLinks(path);

    if (options.block) return stats.isBlockDevice();

    if (options.character) return stats.isCharacterDevice();

    if (options.directory) return stats.isDirectory();

    if (options.file) return stats.isFile();

    /* istanbul ignore next */
    if (options.pipe) return stats.isFIFO();

    /* istanbul ignore next */
    if (options.socket) return stats.isSocket();

    /* istanbul ignore next */
    return false; // fallback
  }

  // No valid expression found
  common.error('could not interpret expression');
  return false;
} // test
module.exports = _test;
