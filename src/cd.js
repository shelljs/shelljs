var fs = require('fs');
var common = require('./common');

//@
//@ ### cd([dir])
//@ Changes to directory `dir` for the duration of the script. Changes to home
//@ directory if no argument is supplied.
function _cd(options, dir) {
  if (!dir)
    dir = common.getUserHome();

  if (dir === '-') {
    if (!common.state.previousDir)
      common.error('could not find previous directory');
    else
      dir = common.state.previousDir;
  }

  // This complexity is so that we only stat once.
  var error = null;
  try {
    var stat = fs.statSync(dir);
    if(stat.isDirectory()) {
      common.state.previousDir = process.cwd();
      process.chdir(dir);
    } else {
      error = 'not a directory: ' + dir;
    }
  } catch (e) {
    error = 'no such file or directory: ' + dir;
  }
  if (error) common.error(error);
}
module.exports = _cd;
