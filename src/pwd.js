var path = require('path');
var common = require('./common');

common.register('pwd', _pwd);

//@
//@ ### pwd()
//@ Returns the current directory.
function _pwd() {
  var pwd = path.resolve(process.cwd());
  return new common.ShellString(pwd, '', common.state.errorCode);
}
module.exports = _pwd;
