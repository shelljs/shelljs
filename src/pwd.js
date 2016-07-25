var path = require('path');
var common = require('./common');

common.register('pwd', _pwd, {wrapOutput: true});

//@
//@ ### pwd()
//@ Returns the current directory.
function _pwd() {
  var pwd = path.resolve(process.cwd());
  return pwd;
}
module.exports = _pwd;
