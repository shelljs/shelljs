var fs = require('fs');
var path = require('path');
var common = require('./common');

common.register('find', _find, {
  cmdOptions: {
    'L': 'link',
  },
});

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

  function pushFile(file) {
    if (process.platform === 'win32') {
      file = file.replace(/\\/g, '/');
    }
    list.push(file);
  }

  function walkDir(root, dir, lsOptions) {
    var entries;
    try {
      entries = fs.readdirSync(dir);
    } catch (e) {
      if (e.code === 'EPERM' || e.code === 'EACCES') {
        common.error('permission denied: ' + dir, { continue: true });
        return;
      }
      throw e;
    }

    entries.forEach(function (name) {
      if (!lsOptions.all && name[0] === '.') {
        return;
      }

      var abs = path.join(dir, name);
      var rel = path.relative(root, abs);
      var stat;
      try {
        stat = lsOptions.link ? common.statFollowLinks(abs) : common.statNoFollowLinks(abs);
      } catch (e) {
        pushFile(path.join(root, rel));
        return;
      }

      pushFile(path.join(root, rel));

      if (stat.isDirectory()) {
        walkDir(root, abs, lsOptions);
      }
    });
  }

  paths.forEach(function (file) {
    var stat;
    try {
      stat = common.statFollowLinks(file);
    } catch (e) {
      common.error('no such file or directory: ' + file);
    }

    pushFile(file);

    if (stat.isDirectory()) {
      walkDir(file, file, { all: true, link: options.link });
    }
  });

  return list;
}
module.exports = _find;
