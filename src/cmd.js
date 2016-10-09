var common = require('./common');
var _tempDir = require('./tempdir');
var path = require('path');
var fs = require('fs');
var child = require('child_process');

common.register('cmd', _cmd, {
  unix: false,
  canReceivePipe: true,
  wrapOutput: false,
});

// Similar to shell.exec(), this is a hack so that we can get concurrent output.
function cmdSync(cmd, args, opts, pipe) {
  var tempDir = _tempDir();
  var stdoutFile = path.join(tempDir, common.randomFileName());
  var stderrFile = path.join(tempDir, common.randomFileName());

  opts = common.extend({
    silent: common.config.silent,
    cwd: process.cwd(),
  }, opts);

  if (common.existsSync(stdoutFile)) common.unlinkSync(stdoutFile);
  if (common.existsSync(stderrFile)) common.unlinkSync(stderrFile);

  // resolve to an absolute path, so if we cd in the child process, it's a no-op
  opts.cwd = path.resolve(opts.cwd);

  var optString = JSON.stringify(opts);

  function cleanUpFiles() {
    try { common.unlinkSync(stdoutFile); } catch (e2) {}
    try { common.unlinkSync(stderrFile); } catch (e2) {}
  }

  opts.stdio = [0, 1, 2];

  var proc;
  try {
    proc = child.spawnSync(process.execPath, [
      path.join(__dirname, 'child.js'),
      stdoutFile,
      stderrFile,
      cmd,
      JSON.stringify(args),
      optString,
      pipe,
    ], opts);
  } catch (e) {
    // Clean up immediately if we have an exception
    cleanUpFiles();
    throw e;
  }

  var stdout = fs.readFileSync(stdoutFile, 'utf8');
  var stderr = fs.readFileSync(stderrFile, 'utf8');
  var code = proc.status;

  // Clean up files (we can delay this to improve performance)
  setTimeout(cleanUpFiles, 0);

  if (code !== 0) {
    common.error(stderr, code, true);
  }
  return new common.ShellString(stdout, stderr, code);
} // cmdSync()

//@
//@ ### cmd(command [, arguments...] [, options] [, callback])
//@ Available options (all `false` by default):
//@
//@ + `silent`: Do not echo program output to console.
//@ + and any option available to NodeJS's
//@   [child_process.spawnSync()](https://nodejs.org/api/child_process.html#child_process_child_process_spawnsync_command_args_options)
//@
//@ Examples:
//@
//@ ```javascript
//@ var version = cmd('node', '--version', {silent:true}).stdout;
//@
//@ cmd('git', 'checkout', 'master', '--', 'file.js');
//@ ```
//@
//@ An alternative for [exec()](#execcommand--options--callback), with better
//@ security around globbing, comamnd injection, and variable expansion. This is
//@ guaranteed to only run one external command, and won't handle special
//@ characters in unexpected and unsafe ways.
//@
//@ By default, this performs globbing on all platforms (but you can disable
//@ this for extra security using `set('-f')`).
function _cmd() {
  var args = [].slice.call(arguments, 0);
  var command;
  var cmdArgs = [];
  var options = {};
  if (args.length < 1 || typeof args[0] !== 'string') {
    common.error('must specify a command to run');
  } else if (args.length === 1) {
    command = args[0]; // just this command, no args, no options
  } else {
    command = args[0];
    var lastArg = args[args.length - 1];
    cmdArgs = typeof lastArg === 'string' ? args.slice(1) : args.slice(1, args.length - 1);
    options = typeof lastArg === 'string' ? {} : lastArg;
  }

  // Perform globbing, unless it's disabled
  if (!common.config.noglob) {
    cmdArgs = common.expand(cmdArgs);
  }

  var pipe = common.readFromPipe();

  options = common.extend({
    silent: common.config.silent,
  }, options);

  // If we're explicitly told to not offer real-time output, use a more
  // efficient function
  if (options.realtimeOutput === false) {
    var result = child.spawnSync(command, cmdArgs, options);
    if (!options.silent) {
      process.stdout.write(result.stdout);
      process.stderr.write(result.stderr);
    }
    return new common.ShellString(result.stdout, result.stderr, result.status);
  } else {
    try {
      return cmdSync(command, cmdArgs, options, pipe);
    } catch (e) {
      common.error('internal error');
    }
  }
}
module.exports = _cmd;
