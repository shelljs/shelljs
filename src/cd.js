var os = require('os');
var common = require('./common');

common.register('cd', _cd, {});

//@
//@ ### cd([dir])
//@
//@ Changes to directory `dir` for the duration of the script. Changes to home
//@ directory if no argument is supplied. Returns a
//@ [ShellString](#shellstringstr) to indicate success or failure.
function _cd(options, dir) {
  if (!dir) dir = os.homedir();

  if (dir === '-') {
    if (!process.env.OLDPWD) {
      common.error('could not find previous directory');
    } else {
      dir = process.env.OLDPWD;
    }
  }

  try {
    var curDir;
    try {
      curDir = process.cwd();
    } catch (cwdError) {
      // A deleted working directory must not prevent changing to a valid one.
      if (cwdError.code !== 'ENOENT') throw cwdError;
    }
    process.chdir(dir);
    if (curDir) {
      process.env.OLDPWD = curDir;
    } else {
      // Do not leave a stale previous directory when the old cwd is unknown.
      delete process.env.OLDPWD;
    }
  } catch (e) {
    // something went wrong, let's figure out the error
    var err;
    try {
      common.statFollowLinks(dir); // if this succeeds, it must be some sort of file
      err = 'not a directory: ' + dir;
    } catch (e2) {
      err = 'no such file or directory: ' + dir;
    }
    if (err) common.error(err);
  }
  return '';
}
module.exports = _cd;
