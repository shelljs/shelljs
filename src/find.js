var path = require('path');
var common = require('./common');
var _ls = require('./ls');

common.register('find', _find, {});

//@
//@ ### find(path [, path ...])
//@ ### find(path_array)
//@
//@ Examples:
//@
//@ ```javascript
//@ find('src', 'lib');
//@ find(['src', 'lib']); // same as above
//@ find('.').filter(function(file) { return file.match(/\.js$/); });
//@ ```
//@
//@ Returns a [ShellString](#shellstringstr) (with array-like properties) of all
//@ files (however deep) in the given paths.
//@
//@ The main difference from `ls('-R', path)` is that the resulting file names
//@ include the base directories (e.g., `lib/resources/file1` instead of just `file1`).
function _find(options, paths) {
  if (!paths) {
    common.error('no path specified');
  } else if (typeof paths === 'string') {
    paths = [].slice.call(arguments, 1);
  }

  var list = [];

  // why not simply do `ls('-R', paths)`? because the output wouldn't give the base dirs
  // to get the base dir in the output, we need instead `ls('-R', 'dir/*')` for every directory

  paths.forEach(function (file) {
    var stat;
    try {
      stat = common.statFollowLinks(file);
    } catch (e) {
      common.error('no such file or directory: ' + file);
    }

    // Node's path.join() below will return platform-appropriate paths,
    // but on Windows paths with POSIX separators may be provided to this function.
    // So normalize:
    list.push(path.normalize(file));

    if (stat.isDirectory()) {
      _ls({ recursive: true, all: true }, file).forEach(function (subfile) {
        list.push(path.join(file, subfile));
      });
    }
  });

  return list;
}
module.exports = _find;
