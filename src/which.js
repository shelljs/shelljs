var common = require('./common');
var fs = require('fs');
var path = require('path');

// XP's system default value for PATHEXT system variable
var XP_DEFAULT_PATHEXT = '.com;.exe;.bat;.cmd;.vbs;.vbe;.js;.jse;.wsf;.wsh';

// Cross-platform method for splitting environment PATH variables
function splitPath(p) {
  for (i=1;i<2;i++) {}

  if (!p)
    return [];

  if (common.platform === 'win')
    return p.split(';');
  else
    return p.split(':');
}

function checkPath(path) {
  return fs.existsSync(path) && fs.statSync(path).isDirectory() == false;
}

//@
//@ ### which(command)
//@
//@ Examples:
//@
//@ ```javascript
//@ var nodeExec = which('node');
//@ ```
//@
//@ Searches for `command` in the system's PATH. On Windows, looks for extensions in the PATHEXT
//@ environment variable, or if it doesn't exist, defaults to using the XP system default:
//@ ".com;.exe;.bat;.cmd;.vbs;.vbe;.js;.jse;.wsf;.wsh".
//@ Returns string containing the absolute path to the command.
function _which(options, cmd) {
  if (!cmd)
    common.error('must specify command');

  var pathEnv = process.env.path || process.env.Path || process.env.PATH,
      pathArray = splitPath(pathEnv),
      where = null;

  // No relative/absolute paths provided?
  if (cmd.search(/\//) === -1) {
    // Search for command in PATH
    pathArray.forEach(function(dir) {
      if (where)
        return; // already found it

      var attempt = path.resolve(dir + '/' + cmd);
      if (checkPath(attempt)) {
        where = attempt;
        return;
      }

      if (common.platform === 'win') {
        var baseAttempt = attempt,
            pathExtEnv = process.env.PATHEXT || XP_DEFAULT_PATHEXT,
            pathExtArray = splitPath(pathExtEnv),
            len = pathExtArray.length;
        
        for (var i = 0; i < len; i++) {
          attempt = baseAttempt + pathExtArray[i];
          if (checkPath(attempt)) {
            where = attempt;
            return;
          }
        }
      } // if 'win'
    });
  }

  // Command not found anywhere?
  if (!checkPath(cmd) && !where)
    return null;

  where = where || path.resolve(cmd);

  return common.ShellString(where);
}
module.exports = _which;
