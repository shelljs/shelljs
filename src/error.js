var common = require('./common');

//@
//@ ### error()
//@ Returns the exit code of the previous command. (Like bash's `$?`).
//@
function error() {
  return common.state.code;
}
module.exports = error;
