var fs = require('fs');
var common = require('./common');

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
    'C': 'context',
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
//@ + `-C <num>`: Show `<num>` lines before and after each result. -B and -A override this option.
//@
//@ Examples:
//@
//@ ```javascript
//@ grep('-v', 'GLOBAL_VARIABLE', '*.js');
//@ grep('GLOBAL_VARIABLE', '*.js');
//@ grep('-B', 3, 'GLOBAL_VARIABLE', '*.js');
//@ grep({ '-B': 3 }, 'GLOBAL_VARIABLE', '*.js');
//@ grep({ '-B': 3, '-C': 2 }, 'GLOBAL_VARIABLE', '*.js');
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
  var contextError = ': invalid context length argument';
  // If the option has been found but not read, copy value from arguments
  if (options.beforeContext === true) {
    idx = 3;
    options.beforeContext = Number(arguments[1]);
    if (options.beforeContext < 0) {
      common.error(options.beforeContext + contextError, 2);
    }
  }
  if (options.afterContext === true) {
    idx = 3;
    options.afterContext = Number(arguments[1]);
    if (options.afterContext < 0) {
      common.error(options.afterContext + contextError, 2);
    }
  }
  if (options.context === true) {
    idx = 3;
    options.context = Number(arguments[1]);
    if (options.context < 0) {
      common.error(options.context + contextError, 2);
    }
  }
  //  If before or after not given but context is, update values
  if (typeof options.context === 'number') {
    if (options.beforeContext === false) {
      options.beforeContext = options.context;
    }
    if (options.afterContext === false) {
      options.afterContext = options.context;
    }
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
      var matches = [];

      lines.forEach(function (line, index) {
        var matched = line.match(regex);
        if ((options.inverse && !matched) || (!options.inverse && matched)) {
          var lineNumber = index + 1;
          var result = {};
          if (matches.length > 0) {
            // If the last result intersects, combine them
            var last = matches[matches.length - 1];
            var minimumLineNumber = Math.max(
              1,
              lineNumber - options.beforeContext - 1,
            );
            if (
              last.hasOwnProperty('' + lineNumber) ||
              last.hasOwnProperty('' + minimumLineNumber)
            ) {
              result = last;
            }
          }
          result[lineNumber] = {
            line,
            match: true,
          };
          if (options.beforeContext > 0) {
            // Store the lines with their line numbers to check for overlap
            lines
              .slice(Math.max(index - options.beforeContext, 0), index)
              .forEach(function (v, i, a) {
                var lineNum = '' + (index - a.length + i + 1);
                if (!result.hasOwnProperty(lineNum)) {
                  result[lineNum] = { line: v, match: false };
                }
              });
          }
          if (options.afterContext > 0) {
            // Store the lines with their line numbers to check for overlap
            lines
              .slice(
                index + 1,
                Math.min(index + options.afterContext + 1, lines.length - 1),
              )
              .forEach(function (v, i) {
                var lineNum = '' + (index + 1 + i + 1);
                if (!result.hasOwnProperty(lineNum)) {
                  result[lineNum] = { line: v, match: false };
                }
              });
          }
          // Only add the result if it's new
          if (!matches.includes(result)) {
            matches.push(result);
          }
        }
      });

      // Loop through the matches and add them to the output
      Array.prototype.push.apply(
        grep,
        matches.map(function (result) {
          return Object.entries(result)
            .map(function (entry) {
              var lineNumber = entry[0];
              var line = entry[1].line;
              var match = entry[1].match;
              return options.lineNumber
                ? lineNumber + (match ? ':' : '-') + line
                : line;
            })
            .join('\n');
        }),
      );
    }
  });

  if (grep.length === 0 && common.state.errorCode !== 2) {
    // We didn't hit the error above, but pattern didn't match
    common.error('', { silent: true });
  }

  var separator = '\n';
  if (
    typeof options.beforeContext === 'number' ||
    typeof options.afterContext === 'number'
  ) {
    separator = '\n--\n';
  }
  return grep.join(separator) + '\n';
}
module.exports = _grep;
