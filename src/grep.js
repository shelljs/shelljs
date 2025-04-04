var common = require('./common');
var fs = require('fs');

common.register('grep', _grep, {
  globStart: _getGlobStart, // don't glob-expand the regex
  canReceivePipe: true,
});

// Gets the index of the first argument after `regex_filter`
function _getGlobStart(args) {
  return (
    Array.prototype.findIndex.call(args, function (v) {
      return (
        v instanceof RegExp ||
        (typeof v === 'string' && v !== '' && !v.startsWith('-'))
      );
    }) + 1
  );
}

// Gets the value of the `beforeContext` or `afterContext` options, removing
// them from the `options` string
function _getContextOption(options, option) {
  var regex = new RegExp('-(\\w*)' + option + '([A-Za-z]*) ?(\\d*)(.*)');
  var value = null;
  var replaced = options.replace(regex, function (_, before, after, val, rest) {
    var result = '';
    if (before || after || rest) {
      result = (before + after + rest).trim();
      if (result && !result.startsWith('-')) {
        result = '-' + result;
      }
    }
    value = parseInt(val);
    return result;
  });
  return { options: replaced, value: value };
}

// Gets the value of the `before` and `after` context options
function _getContextOptions(options) {
  var before = _getContextOption(options, 'B');
  var after = _getContextOption(before.options, 'A');
  if (Number.isNaN(after.value)) {
    after.value = before.value;
  }
  return {
    before: before.value,
    after: after.value,
    options: after.options.trim(),
  };
}

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
//@ ```
//@
//@ Reads input string from given files and returns a
//@ [ShellString](#shellstringstr) containing all lines of the @ file that match
//@ the given `regex_filter`.
function _grep(options, regex, files) {
  // Check if this is coming from a pipe
  var pipe = common.readFromPipe();

  if (!files && !pipe) common.error('no paths given', 2);

  var args = Array.from(arguments);
  var idx = args[0] === '--' ? 2 : _getGlobStart(args);
  options = args.slice(0, idx - 1).join(' ');
  regex = args[idx - 1];
  files = args.slice(idx);

  if (pipe) {
    files.unshift('-');
  }

  var contextOptions = _getContextOptions(options);
  options = common.parseOptions(contextOptions.options, {
    v: 'inverse',
    l: 'nameOnly',
    i: 'ignoreCase',
    n: 'lineNumber',
  });

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
          if (contextOptions.before) {
            var before = Array.from(
              lines
                .slice(Math.max(index - contextOptions.before, 0), index)
                .map(function (v, i, a) {
                  return options.lineNumber
                    ? index - a.length + i + 1 + '-' + v
                    : v;
                })
            );
            result = before.join('\n') + '\n' + result;
          }
          if (contextOptions.after) {
            var after = Array.from(
              lines
                .slice(
                  index + 1,
                  Math.min(index + contextOptions.after + 1, lines.length - 1)
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
  if (contextOptions.before || contextOptions.after) {
    separator = '\n--\n';
  }
  return grep.join(separator) + '\n';
}
module.exports = _grep;
