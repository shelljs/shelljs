var common = require('./common');

//@
//@ ### ls([options,] [path, ...])
//@ ### ls([options,] path_array)
//@ Available options:
//@
//@ + `-R`: recursive
//@ + `-A`: all files (include files beginning with `.`, except for `.` and `..`)
//@
//@ Examples:
//@
//@ ```javascript
//@ ls('projs/*.js');
//@ ls('-R', '/users/me', '/tmp');
//@ ls('-R', ['/users/me', '/tmp']); // same as above
//@ ```
//@
//@ Returns array of files in the given path, or in current directory if no path provided.
function _ls(options, paths) {
  options = common.parseOptions(options, {
    'R': 'recursive',
    'A': 'all',
    'a': 'all_deprecated',
    'd': 'directory'
  });

  if (options.all_deprecated) {
    // We won't support the -a option as it's hard to image why it's useful
    // (it includes '.' and '..' in addition to '.*' files)
    // For backwards compatibility we'll dump a deprecated message and proceed as before
    common.log('ls: Option -a is deprecated. Use -A instead');
    options.all = true;
  }

  if (typeof paths === 'string') paths = [].slice.call(arguments, 1);
  paths = paths || [];

  paths = paths.map(function (path) {
    path += (options.recursive ? '/**/*' : '/*');
    return path.replace(/\\/g, '/');
  });

  var files = common.expand(paths, { dot: options.all });

  // I'm not sure if we need this.
  if (common.platform === 'win') {
    files = files.map(function (file) {
      return file.replace(/\\/g, '/');
    });
  }

  return files;
}
module.exports = _ls;
