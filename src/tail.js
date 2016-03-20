var common = require('./common');
var fs = require('fs');

//@
//@ ### tail([{'-n', \<num\>},] file [, file ...])
//@ ### tail([{'-n', \<num\>},] file_array)
//@
//@ Examples:
//@
//@ ```javascript
//@ var str = tail({'-n', 1}, 'file*.txt');
//@ var str = tail('file1', 'file2');
//@ var str = tail(['file1', 'file2']); // same as above
//@ ```
//@
//@ Output the last 10 lines of a file (or the last `<num>` if `-n` is
//@ specified)
function _tail(options, files) {
  options = common.parseOptions(options, {
    'n': 'numLines'
  });
  var tail = [];
  var pipe = common.readFromPipe(this);

  if (!files && !pipe)
    common.error('no paths given');

  var idx = 1;
  if (options.numLines === true) {
    idx = 2;
    options.numLines = Number(arguments[1]);
  } else if (options.numLines === false) {
    options.numLines = 10;
  }
  options.numLines = -1 * Math.abs(options.numLines);
  files = [].slice.call(arguments, idx);

  if (pipe)
    files.unshift('-');

  var shouldAppendNewline = false;
  files.forEach(function(file) {
    if (!fs.existsSync(file) && file !== '-') {
      common.error('no such file or directory: ' + file, true);
      return;
    }

    var contents = file === '-' ? pipe : fs.readFileSync(file, 'utf8');

    var lines = contents.split('\n');
    if (lines[lines.length-1] === '') {
      lines.pop();
      shouldAppendNewline = true;
    } else {
      shouldAppendNewline = false;
    }

    tail = tail.concat(lines.slice(options.numLines));
  });

  if (shouldAppendNewline)
    tail.push(''); // to add a trailing newline once we join
  return new common.ShellString(tail.join('\n'), common.state.error, common.state.errorCode);
}
module.exports = _tail;
