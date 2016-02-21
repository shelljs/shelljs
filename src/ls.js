var path = require('path');
var fs = require('fs');
var common = require('./common');
var glob = require('glob');

var globPatternAll = path.sep + '*';
var globPatternRecrusive = path.sep + '**' + globPatternAll;

//@
//@ ### ls([options,] [path, ...])
//@ ### ls([options,] path_array)
//@ Available options:
//@
//@ + `-R`: recursive
//@ + `-A`: all files (include files beginning with `.`, except for `.` and `..`)
//@ + `-d`: list directories themselves, not their contents
//@ + `-l`: list objects representing each file, each with fields containing `ls
//@         -l` output fields. See
//@         [fs.Stats](https://nodejs.org/api/fs.html#fs_class_fs_stats)
//@         for more info
//@
//@ Examples:
//@
//@ ```javascript
//@ ls('projs/*.js');
//@ ls('-R', '/users/me', '/tmp');
//@ ls('-R', ['/users/me', '/tmp']); // same as above
//@ ls('-l', 'file.txt'); // { name: 'file.txt', mode: 33188, nlink: 1, ...}
//@ ```
//@
//@ Returns array of files in the given path, or in current directory if no path provided.
function _ls(options, paths) {
  options = common.parseOptions(options, {
    'R': 'recursive',
    'A': 'all',
    'a': 'all_deprecated',
    'd': 'directory',
    'l': 'long'
  });

  if (options.all_deprecated) {
    // We won't support the -a option as it's hard to image why it's useful
    // (it includes '.' and '..' in addition to '.*' files)
    // For backwards compatibility we'll dump a deprecated message and proceed as before
    common.log('ls: Option -a is deprecated. Use -A instead');
    options.all = true;
  }

  if (!paths)
    paths = ['.'];
  else if (typeof paths === 'string')
    paths = [].slice.call(arguments, 1);

  paths = common.expand(paths, { dot: options.all });

  var list = [];

  function pushFile(file, rel, stat) {
    stat = stat || fs.lstatSync(file);
    if (process.platform === 'win32') file = file.replace(/\\/, '/');
    if (options.long) {
      list.push(ls_stat(file, stat));
    } else {
      list.push(path.relative(rel || '.', file));
    }
  }

  paths.forEach(function(p) {
    var stat;

    try {
      stat = fs.lstatSync(p);
    } catch (e) {
      common.error('no such file or directory: ' + p, true);
    }

    // If the stat failed.
    if (stat) {
      if (!options.directory && stat.isDirectory()) {
        var pathWithGlob = p + (options.recursive ? globPatternRecrusive : globPatternAll);

        glob.sync(pathWithGlob, { dot: options.all }).forEach(function (item) {
          pushFile(item, p);
        });
      } else {
        pushFile(p, null, stat);
      }
    }
  });

  // Add methods, to make this more compatible with ShellStrings
  return new common.ShellString(list, common.state.error);
}

function ls_stat(path, stats) {
  // Note: this object will contain more information than .toString() returns
  stats.name = path;
  stats.toString = function() {
    // Return a string resembling unix's `ls -l` format
    return [this.mode, this.nlink, this.uid, this.gid, this.size, this.mtime, this.name].join(' ');
  };
  return stats;
}

module.exports = _ls;
