var common = require('./common');
var fs = require('fs');
var path = require('path');
var read = require('fs-readdir-recursive');


common.register('grep', _grep, {
  globStart: 2, // don't glob-expand the regex
  canReceivePipe: true,
  cmdOptions: {
    'v': 'inverse',
    'l': 'nameOnly',
    'i': 'ignoreCase',
    'r': 'recursive',
  },
});

//@
//@ ### grep([options,] regex_filter, file [ ...file, ...directory])
//@ ### grep([options,] regex_filter, file_array,directory_array)
//@
//@ Available options:
//@
//@ + `-v`: Invert `regex_filter` (only print non-matching lines).
//@ + `-l`: Print only filenames of matching files.
//@ + `-i`: Ignore case.
//@ + `-r`: recursive search
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

function getFilesInDir(directory) {
  var files = read(directory);
  for (var i = 0; i < files.length; i++) {
    files[i] = path.join(directory, path.dirname(files[i]), path.basename(files[i]));
  }
  return files;
}

function _grep(options, regex, files) {
  var pipe = common.readFromPipe();
  if (!files && !pipe) common.error('No paths given', 2);
  files = [].slice.call(arguments, 2);

  if (pipe) {
    files.unshift('-');
  }

  var grep = [];
  var contents = '';
  if (options.ignoreCase) {
    regex = new RegExp(regex, 'i');
  }

  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    if (!fs.existsSync(file) && file !== '-') {
      common.error('no such file or directory: ' + file, 2, { silent: true });
    } else if (!fs.existsSync(file) && file === '-') {
      contents = pipe;
    } else if (options.recursive && fs.statSync(file).isDirectory()) {
      files = files.concat(getFilesInDir(file));
    } else if (!options.recursive && fs.statSync(file).isDirectory()) {
      common.error(file + ' Is a directory', 2, { silent: true });
      return;
    } else if (fs.statSync(file).isFile()) {
      contents = fs.readFileSync(file, 'utf8');
    }

    if (options.nameOnly) {
      if (contents.match(regex)) {
        grep.push(file);
      }
    } else {
      var lines = contents.split('\n');
      lines.forEach(function (line) {
        var matched = line.match(regex);
        if ((options.inverse && !matched) || (!options.inverse && matched)) {
          grep.push(line);
        }
      });
    }
  }
  if (grep.length === 0 && common.state.errorCode !== 2) {
    // We didn't hit the error above, but pattern didn't match
    common.error('', { silent: true });
  }
  return grep.join('\n') + '\n';
}

module.exports = _grep;
