var common = require('./common');

//@
//@ ### error()
//@ Tests if error occurred in the last command. Returns `null` if no error occurred,
//@ otherwise returns string explaining the error
function _error() {
  return common.state.error;
}
exports.error = _error;

//@
//@ ### errorCode()
//@ Returns status code for the last command. Returns 0 upon success, otherwise
//@ returns a nonzero integer
function _errorCode() {
  return common.state.errorCode;
}
exports.errorCode = _errorCode;
