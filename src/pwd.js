var path = require('path');
var common = require('./common');

function pwd(options) {
  var pwd = path.resolve(process.cwd());
  return common.ShellString(pwd);
}
module.exports = pwd;
