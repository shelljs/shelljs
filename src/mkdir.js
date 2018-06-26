var common = require('./common');
var fs = require('fs');
var path = require('path');

common.register('mkdir', _mkdir, {
  cmdOptions: {
    'p': 'fullpath',
  },
});

// See mkdir(2) for details on each error case
// http://man7.org/linux/man-pages/man2/mkdir.2.html
var codeToMessage = {
  EACCES: 'Permission denied',
  EEXIST: 'File exists',
  ENAMETOOLONG: 'File name too long',
  ENOENT: 'No such file or directory',
  ENOTDIR: 'Not a directory',
};

// Recursively creates `dir`
function mkdirSyncRecursive(dir) {
  var baseDir = path.dirname(dir);

  // Prevents some potential problems arising from malformed UNCs or
  // insufficient permissions.
  /* istanbul ignore next */
  if (baseDir === dir) {
    common.error('dirname() failed: [' + dir + ']');
  }

  // Base dir exists, no recursion necessary
  if (fs.existsSync(baseDir)) {
    fs.mkdirSync(dir, parseInt('0777', 8));
    return;
  }

  // Base dir does not exist, go recursive
  mkdirSyncRecursive(baseDir);

  // Base dir created, can create dir
  fs.mkdirSync(dir, parseInt('0777', 8));
}

//@
//@ ### mkdir([options,] dir [, dir ...])
//@ ### mkdir([options,] dir_array)
//@
//@ Available options:
//@
//@ + `-p`: full path (and create intermediate directories, if necessary)
//@
//@ Examples:
//@
//@ ```javascript
//@ mkdir('-p', '/tmp/a/b/c/d', '/tmp/e/f/g');
//@ mkdir('-p', ['/tmp/a/b/c/d', '/tmp/e/f/g']); // same as above
//@ ```
//@
//@ Creates directories.
function _mkdir(options, dirs) {
  if (!dirs) common.error('no paths given');

  dirs = [].slice.call(arguments, 1);

  dirs.forEach(function (dir) {
    // Skip mkdir if -p option is given and directory already exists
    if (fs.existsSync(dir) && common.statNoFollowLinks(dir).isDirectory() &&
      options.fullpath) {
      return;
    }

    try {
      if (options.fullpath) {
        mkdirSyncRecursive(path.resolve(dir));
      } else {
        fs.mkdirSync(dir, parseInt('0777', 8));
      }
    } catch (e) {
      var reason = codeToMessage[e.code];

      /* istanbul ignore if */
      if (!reason) throw e;

      common.error('cannot create directory \'' + dir + '\': ' + reason, {
        continue: true,
      });
    }
  });
  return '';
} // mkdir
module.exports = _mkdir;
