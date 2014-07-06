var fs   = require('fs');
var path = require('path');

var common = require('./common');

//@
//@ ### cd('dir')
//@ Changes to directory `dir` for the duration of the script
function _cd(options, dir) {
  var env = process.env

  if (!dir) dir = env.HOME;

  dir.replace(/^~\//, function () { return env.HOME + '/' });
  dir = path.resolve(env.PWD, dir);

  if (!fs.existsSync(dir))
    common.error('no such file or directory: ' + dir);

  if (!fs.statSync(dir).isDirectory())
    common.error('not a directory: ' + dir);

  process.chdir(dir);
  env.PWD = dir;
}
module.exports = _cd;
