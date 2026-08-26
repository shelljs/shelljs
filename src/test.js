var fs = require('fs');
var common = require('./common');

var testOptions = {
  'b': 'block',
  'c': 'character',
  'd': 'directory',
  'e': 'exists',
  'f': 'file',
  'L': 'link',
  'n': 'nonempty',
  'p': 'pipe',
  'S': 'socket',
  'z': 'empty',
};

var integerOperators = ['-eq', '-ne', '-gt', '-ge', '-lt', '-le'];

common.register('test', _test, {
  cmdOptions: null,
  wrapOutput: false,
  allowGlobbing: false,
});


//@
//@ ### test(expression)
//@
//@ Available expression primaries include:
//@
//@ + `'-b', 'path'`: true if path is a block device
//@ + `'-c', 'path'`: true if path is a character device
//@ + `'-d', 'path'`: true if path is a directory
//@ + `'-e', 'path'`: true if path exists
//@ + `'-f', 'path'`: true if path is a regular file
//@ + `'-L', 'path'`: true if path is a symbolic link
//@ + `'-p', 'path'`: true if path is a pipe (FIFO)
//@ + `'-S', 'path'`: true if path is a socket
//@ + `'-n', 'string'`: true if the string is not empty
//@ + `'-z', 'string'`: true if the string is empty
//@ + `'string1', '=', 'string2'`: true if both strings are equal
//@ + `'string1', '!=', 'string2'`: true if both strings are not equal
//@ + `'integer1', '-eq', 'integer2'`: true if both integers are equal
//@ + `'integer1', '-ne', 'integer2'`: true if both integers are not equal
//@ + `'integer1', '-gt', 'integer2'`: true if integer1 is greater than integer2
//@ + `'integer1', '-ge', 'integer2'`: true if integer1 is greater than or equal to integer2
//@ + `'integer1', '-lt', 'integer2'`: true if integer1 is less than integer2
//@ + `'integer1', '-le', 'integer2'`: true if integer1 is less than or equal to integer2
//@
//@ Examples:
//@
//@ ```javascript
//@ if (test('-d', path)) { /* do something with dir */ };
//@ if (!test('-f', path)) continue; // skip if it's not a regular file
//@ if (test(process.env.NODE_ENV || '', '=', 'production')) { /* production */ };
//@ if (test(process.env.BUILD_NUMBER || '0', '-gt', '100')) { /* milestone */ };
//@ ```
//@
//@ Evaluates `expression` using the available primaries and returns
//@ corresponding boolean value.
function parseInteger(value) {
  var number = value;
  if (typeof value === 'string' && /^[+-]?\d+$/.test(value)) {
    number = Number(value);
  }

  if (typeof number !== 'number' || !Number.isSafeInteger(number)) {
    common.error('integer expression expected');
  }

  return number;
}

function compareIntegers(left, operator, right) {
  var leftInteger = parseInteger(left);
  var rightInteger = parseInteger(right);

  if (operator === '-eq') return leftInteger === rightInteger;
  if (operator === '-ne') return leftInteger !== rightInteger;
  if (operator === '-gt') return leftInteger > rightInteger;
  if (operator === '-ge') return leftInteger >= rightInteger;
  if (operator === '-lt') return leftInteger < rightInteger;
  if (operator === '-le') return leftInteger <= rightInteger;

  var e = new Error('Unknown operator: ' + operator);
  e.name = 'ShellJSInternalError';
  throw e;
}

function testBinary(left, operator, right) {
  if (operator === '=' || operator === '!=') {
    if (typeof left !== 'string' || typeof right !== 'string') {
      common.error('string expression expected');
    }
    return operator === '=' ? left === right : left !== right;
  }

  if (integerOperators.indexOf(operator) !== -1) {
    return compareIntegers(left, operator, right);
  }

  common.error('could not interpret expression');
}

function testUnary(operator, operand) {
  if (typeof operator === 'string' && operator[0] !== '-') {
    common.error('could not interpret expression');
  }
  var options = common.parseOptions(operator, testOptions);

  var canInterpret = false;
  Object.keys(options).forEach(function (key) {
    if (options[key] === true) {
      canInterpret = true;
    }
  });

  if (!canInterpret) common.error('could not interpret expression');

  if (options.nonempty || options.empty) {
    if (typeof operand !== 'string') {
      common.error('string expression expected');
    }
    return options.nonempty ? operand.length > 0 : operand.length === 0;
  }

  if (!operand) common.error('no path given');

  if (options.link) {
    try {
      return common.statNoFollowLinks(operand).isSymbolicLink();
    } catch (e) {
      return false;
    }
  }

  if (!fs.existsSync(operand)) return false;

  if (options.exists) return true;

  var stats = common.statFollowLinks(operand);

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

function _test() {
  var args = [].slice.call(arguments);

  // The standard wrapper prepends an empty options argument when the first
  // user argument is not an option. Remove only that synthetic argument.
  if (args[0] === '') args.shift();

  if (args.length === 2) return testUnary(args[0], args[1]);
  if (args.length === 3) return testBinary(args[0], args[1], args[2]);

  common.error('could not interpret expression');
} // test
module.exports = _test;
