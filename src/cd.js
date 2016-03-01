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

  try {
    var curDir = process.cwd();
    process.chdir(dir);
    common.state.previousDir = curDir;
  } catch (e) {
    // something went wrong, let's figure out the error
    var err;
    try {
      fs.statSync(dir); // if this succeeds, it must be some sort of file
      err = 'not a directory: ' + dir;
    } catch (e) {
      err = 'no such file or directory: ' + dir;
    }
    if (err) common.error(err);
  }
}
module.exports = _cd;
