var common = require('./common');
var execa = require('execa');

var DEFAULT_MAXBUFFER_SIZE = 20 * 1024 * 1024;
var COMMAND_NOT_FOUND_ERROR_CODE = 127;

common.register('cmd', _cmd, {
  cmdOptions: null,
  globStart: 1,
  canReceivePipe: true,
  wrapOutput: true,
});

function commandNotFound(execaResult) {
  if (process.platform === 'win32') {
    var str = 'is not recognized as an internal or external command';
    return execaResult.code && execaResult.stderr.includes(str);
  } else {
    return execaResult.code &&
      execaResult.stdout === null && execaResult.stderr === null;
  }
}

function _cmd(options, command, commandArgs, userOptions) {
  if (!command) {
    common.error('Must specify a non-empty string as a command');
  }

  // `options` will usually not have a value: it's added by our commandline flag
  // parsing engine.
  commandArgs = [].slice.call(arguments, 2);

  // `userOptions` may or may not be provided. We need to check the last
  // argument. If it's an object, assume it's meant to be passed as
  // userOptions (since ShellStrings are already flattened to strings).
  if (commandArgs.length === 0) {
    userOptions = {};
  } else {
    var lastArg = commandArgs.pop();
    if (common.isObject(lastArg)) {
      userOptions = lastArg;
    } else {
      userOptions = {};
      commandArgs.push(lastArg);
    }
  }

  var pipe = common.readFromPipe();

  // Some of our defaults differ from execa's defaults. These can be overridden
  // by the user.
  var defaultOptions = {
    maxBuffer: DEFAULT_MAXBUFFER_SIZE,
    stripEof: false, // Preserve trailing newlines for consistency with unix.
    reject: false, // Use ShellJS's error handling system.
  };

  // For other options, we forbid the user from overriding them (either for
  // correctness or security).
  var requiredOptions = {
    input: pipe,
    shell: false,
  };

  var execaOptions =
    Object.assign(defaultOptions, userOptions, requiredOptions);

  var result = execa.sync(command, commandArgs, execaOptions);
  var stdout;
  var stderr;
  var code;
  if (commandNotFound(result)) {
    // This can happen if `command` is not an executable binary, or possibly
    // under other conditions.
    stdout = '';
    stderr = "'" + command + "': command not found";
    code = COMMAND_NOT_FOUND_ERROR_CODE;
  } else {
    stdout = result.stdout.toString();
    stderr = result.stderr.toString();
    code = result.code;
  }

  // Pass `continue: true` so we can specify a value for stdout.
  if (code) common.error(stderr, code, { silent: true, continue: true });
  return new common.ShellString(stdout, stderr, code);
}
module.exports = _cmd;
