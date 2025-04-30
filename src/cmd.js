var execa = require('execa');
var common = require('./common');

var DEFAULT_MAXBUFFER_SIZE = 20 * 1024 * 1024;
var COMMAND_NOT_FOUND_ERROR_CODE = 127;

common.register('cmd', _cmd, {
  cmdOptions: null,
  globStart: 1,
  canReceivePipe: true,
  wrapOutput: true,
});

function isCommandNotFound(execaResult) {
  if (process.platform === 'win32') {
    var str = 'is not recognized as an internal or external command';
    return execaResult.exitCode && execaResult.stderr.includes(str);
  }
  return execaResult.failed && execaResult.code === 'ENOENT';
}

function isExecaInternalError(result) {
  if (typeof result.stdout !== 'string') return true;
  if (typeof result.stderr !== 'string') return true;
  if (typeof result.exitCode !== 'number') return true;
  if (result.exitCode === 0 && result.failed) return true;
  // Otherwise assume this executed correctly. The command may still have exited
  // with non-zero status, but that's not due to anything execa did.
  return false;
}

//@
//@ ### cmd(arg1[, arg2, ...] [, options])
//@
//@ Available options:
//@
//@ + `cwd: directoryPath`: change the current working directory only for this
//@   cmd() invocation.
//@ + `maxBuffer: num`: Raise or decrease the default buffer size for
//@   stdout/stderr.
//@ + `timeout`: Change the default timeout.
//@
//@ Examples:
//@
//@ ```javascript
//@ var version = cmd('node', '--version').stdout;
//@ cmd('git', 'commit', '-am', `Add suport for node ${version}`);
//@ console.log(cmd('echo', '1st arg', '2nd arg', '3rd arg').stdout)
//@ console.log(cmd('echo', 'this handles ;, |, &, etc. as literal characters').stdout)
//@ ```
//@
//@ Executes the given command synchronously. This is intended as an easier
//@ alternative for [exec()](#execcommand--options--callback), with better
//@ security around globbing, comamnd injection, and variable expansion. This is
//@ guaranteed to only run one external command, and won't give special
//@ treatment for any shell characters (ex. this treats `|` as a literal
//@ character, not as a shell pipeline).
//@ This returns a [ShellString](#shellstringstr).
//@
//@ By default, this performs globbing on all platforms, but you can disable
//@ this with `set('-f')`.
//@
//@ This **does not** support asynchronous mode. If you need asynchronous
//@ command execution, check out [execa](https://www.npmjs.com/package/execa) or
//@ the node builtin `child_process.execFile()` instead.
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
    stripFinalNewline: false, // Preserve trailing newlines for consistency with unix.
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
  if (isCommandNotFound(result)) {
    // This can happen if `command` is not an executable binary, or possibly
    // under other conditions.
    stdout = '';
    stderr = "'" + command + "': command not found";
    code = COMMAND_NOT_FOUND_ERROR_CODE;
  } else if (isExecaInternalError(result)) {
    // Catch-all: execa tried to run `command` but it encountered some error
    // (ex. maxBuffer, timeout).
    stdout = result.stdout || '';
    stderr = result.stderr ||
             `'${command}' encountered an error during execution`;
    code = result.exitCode !== undefined && result.exitCode > 0 ? result.exitCode : 1;
  } else {
    // Normal exit: execa was able to execute `command` and get a return value.
    stdout = result.stdout.toString();
    stderr = result.stderr.toString();
    code = result.exitCode;
  }

  // Pass `continue: true` so we can specify a value for stdout.
  if (code) common.error(stderr, code, { silent: true, continue: true });
  return new common.ShellString(stdout, stderr, code);
}
module.exports = _cmd;
