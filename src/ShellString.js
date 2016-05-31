var shell = require('..');

//@
//@ ### ShellString(str)
//@
//@ Examples:
//@
//@ ```javascript
//@ var foo = ShellString('hello world');
//@ ```
//@
//@ Turns a regular string into a string-like object similar to what each
//@ command returns. This has special methods, like `.to()` and `.toEnd()
var ShellString = function (stdout, stderr, code) {
  var that;
  if (stdout instanceof Array) {
    that = stdout;
    that.stdout = stdout.join('\n');
    if (stdout.length > 0) that.stdout += '\n';
  } else {
    that = new String(stdout);
    that.stdout = stdout;
  }
  that.stderr = stderr;
  that.code = code;
  that.to    = function() {wrap('to', _to, {idx: 1}).apply(that.stdout, arguments); return that;};
  that.toEnd = function() {wrap('toEnd', _toEnd, {idx: 1}).apply(that.stdout, arguments); return that;};
  ['cat', 'head', 'sed', 'sort', 'tail', 'grep', 'exec'].forEach(function (cmd) {
    that[cmd] = function() {return shell[cmd].apply(that.stdout, arguments);};
  });
  return that;
};
