var common = require('./common');
var fs = require('fs');

common.register('grep', _grep, {
  globStart: 2, // don't glob-expand the regex
  canReceivePipe: true,
  cmdOptions: {
    'v': 'inverse',
    'l': 'nameOnly',
    'i': 'ignoreCase',
    'n': 'lineNumber',
    'B': 'beforeContext',
    'A': 'afterContext',
  },
});

//@
//@ ### grep([options,] regex_filter, file [, file ...])
//@ ### grep([options,] regex_filter, file_array)
//@
//@ Available options:
//@
//@ + `-v`: Invert `regex_filter` (only print non-matching lines).
//@ + `-l`: Print only filenames of matching files.
//@ + `-i`: Ignore case.
//@ + `-n`: Print line numbers.
//@ + `-B <num>`: Show `<num>` lines before each result.
//@ + `-A <num>`: Show `<num>` lines after each result.
//@
//@ Examples:
//@
//@ ```javascript
//@ grep('-v', 'GLOBAL_VARIABLE', '*.js');
//@ grep('GLOBAL_VARIABLE', '*.js');
//@ grep('-B', 3, 'GLOBAL_VARIABLE', '*.js');
//@ grep({ '-B': 3 }, 'GLOBAL_VARIABLE', '*.js');
//@ ```
//@
//@ Reads input string from given files and returns a
//@ [ShellString](#shellstringstr) containing all lines of the @ file that match
//@ the given `regex_filter`.
function _grep(options, regex, files) {
  // Check if this is coming from a pipe
  var pipe = common.readFromPipe();

  if (!files && !pipe) common.error('no paths given', 2);

  var idx = 2;
  if (options.beforeContext === true) {
    idx = 3;
    options.beforeContext = Number(arguments[1]);
  }
  if (options.afterContext === true) {
    idx = 3;
    options.afterContext = Number(arguments[1]);
  }
  regex = arguments[idx - 1];
  files = [].slice.call(arguments, idx);

  if (pipe) {
    files.unshift('-');
  }

  var grep = [];
  if (options.ignoreCase) {
    regex = new RegExp(regex, 'i');
  }
  files.forEach(function (file) {
    if (!fs.existsSync(file) && file !== '-') {
      common.error('no such file or directory: ' + file, 2, { continue: true });
      return;
    }

    var contents = file === '-' ? pipe : fs.readFileSync(file, 'utf8');
    if (options.nameOnly) {
      if (contents.match(regex)) {
        grep.push(file);
      }
    } else {
      var lines = contents.split('\n');
      lines.forEach(function (line, index) {
        var matched = line.match(regex);
        if ((options.inverse && !matched) || (!options.inverse && matched)) {
          var result = line;
          if (options.lineNumber) {
            result = '' + (index + 1) + ':' + line;
          }
          if (options.beforeContext) {
            var before = Array.from(
              lines
                .slice(Math.max(index - options.beforeContext, 0), index)
                .map(function (v, i, a) {
                  return options.lineNumber
                    ? index - a.length + i + 1 + '-' + v
                    : v;
                })
            );
            result = before.join('\n') + '\n' + result;
          }
          if (options.afterContext) {
            var after = Array.from(
              lines
                .slice(
                  index + 1,
                  Math.min(index + options.afterContext + 1, lines.length - 1)
                )
                .map(function (v, i) {
                  return options.lineNumber ? index + 1 + (i + 1) + '-' + v : v;
                })
            );
            result += '\n' + after.join('\n');
          }
          grep.push(result);
        }
      });
    }
  });

  if (grep.length === 0 && common.state.errorCode !== 2) {
    // We didn't hit the error above, but pattern didn't match
    common.error('', { silent: true });
  }

  var separator = '\n';
  if (options.beforeContext || options.afterContext) {
    separator = '\n--\n';
  }
  return grep.join(separator) + '\n';
}
module.exports = _grep;
