var common = require('./common');
var fs = require('fs');

// This reads n or more lines, or the entire file, whichever is less.
function readSomeLines(file, numLines) {
  var BUF_LENGTH = 64*1024,
      buf = new Buffer(BUF_LENGTH),
      bytesRead = BUF_LENGTH,
      pos = 0,
      fdr = null;

  try {
    fdr = fs.openSync(file, 'r');
  } catch(e) {
    common.error('cannot read file: ' + file);
  }

  var numLinesRead = 0;
  var ret = '';
  while (bytesRead === BUF_LENGTH && numLinesRead < numLines) {
    bytesRead = fs.readSync(fdr, buf, 0, BUF_LENGTH, pos);
    var bufStr = buf.toString('utf8', 0, bytesRead);
    numLinesRead += bufStr.split('\n').length - 1;
    ret += bufStr;
    pos += bytesRead;
  }

  fs.closeSync(fdr);
  return ret;
}
//@
//@ ### head([{'-n', \<num\>},] file [, file ...])
//@ ### head([{'-n', \<num\>},] file_array)
//@
//@ Examples:
//@
//@ ```javascript
//@ var str = head({'-n', 1}, 'file*.txt');
//@ var str = head('file1', 'file2');
//@ var str = head(['file1', 'file2']); // same as above
//@ ```
//@
//@ Output the first 10 lines of a file (or the first `<num>` if `-n` is
//@ specified)
function _head(options, files) {
  options = common.parseOptions(options, {
    'n': 'numLines'
  });
  var head = [];
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
  files = [].slice.call(arguments, idx);

  if (pipe)
    files.unshift('-');

  var shouldAppendNewline = false;
  files.forEach(function(file) {
    if (!fs.existsSync(file) && file !== '-') {
      common.error('no such file or directory: ' + file, true);
      return;
    }

    var contents;
    if (file === '-')
      contents = pipe;
    else if (options.numLines < 0) {
      contents = fs.readFileSync(file, 'utf8');
    } else {
      contents = readSomeLines(file, options.numLines);
    }

    var lines = contents.split('\n');
    var hasTrailingNewline = (lines[lines.length-1] === '');
    if (hasTrailingNewline)
      lines.pop();
    shouldAppendNewline = (hasTrailingNewline || options.numLines < lines.length);

    head = head.concat(lines.slice(0, options.numLines));
  });

  if (shouldAppendNewline)
    head.push(''); // to add a trailing newline once we join
  return new common.ShellString(head.join('\n'), common.state.error, common.state.errorCode);
}
module.exports = _head;
