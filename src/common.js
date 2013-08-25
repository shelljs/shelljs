var os = require('os');

// Module globals
var config = {
  silent: false,
  fatal: false
};
exports.config = config;

var state = {
  error: null,
  currentCmd: 'shell.js',
  tempDir: null
};
exports.state = state;

var platform = os.type().match(/^Win/) ? 'win' : 'unix';
exports.platform = platform;

// Shows error message. Throws unless _continue or config.fatal are true
function error(msg, _continue) {
  if (state.error === null)
    state.error = '';
  state.error += state.currentCmd + ': ' + msg + '\n';

  log(state.error);

  if (config.fatal)
    process.exit(1);

  if (!_continue)
    throw '';
}
exports.error = error;
