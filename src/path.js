
var path = require('path'),
    common = require('./common'),
    delimiter = path.delimiter // not available in 0.8.x
      || (common.platform === 'win' ? ';' : ':');


//@
//@ ### path()
//@ ### path(dir)
//@
//@ Examples:
//@
//@ ```javascript
//@ // add /foo/bar to PATH
//@ shelljs.path('/foo/bar')
//@
//@ // get the value of PATH
//@ var path = shelljs.path()
//@ ```
//@
//@ Note: using `path('/some/dir')` will not update the system-wide PATH, but
//@ instead, the PATH for the current process and any child process it may
//@ spawn.
//@
//@ Returns the PATH environment as an array, optionally adding the given `dir`.
function _path(opts, dir) {
  var dirs = process.env[getPathKey()].split(delimiter);

  // get
  if (!dir) {
    return dirs;
  }

  // don't re-add to PATH
  if (dirs.indexOf(dir) === -1) {
    dirs.push(dir.trim());
  }

  // set
  process.env[getPathKey()] = dirs.join(delimiter);
  return dirs;
}

function getPathKey() {
  var keys = [ 'path', 'Path', 'PATH' ];
  for (var i = keys.length - 1; i >= 0; i--) {
    if (typeof process.env[keys[i]] === 'string') {
      return keys[i];
    }
  }
}


module.exports = _path;
