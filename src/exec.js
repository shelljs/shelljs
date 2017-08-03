var common = require('./common');
var _pwd = require('./pwd');
var path = require('path');
var child = require('child_process');

var DEFAULT_MAXBUFFER_SIZE = 20 * 1024 * 1024;

common.register('exec', _exec, {
  unix: false,
  canReceivePipe: true,
  wrapOutput: false,
});

function execSync(cmd, opts, pipe) {
  var silent = opts.silent || common.config.silent;
  var stdout;
  var stderr;
  var code;

  opts = common.extend({
    cwd: _pwd().toString(),
    env: process.env,
    maxBuffer: DEFAULT_MAXBUFFER_SIZE,
    shell: true,
  }, opts);

  opts.encoding = 'utf8';

  if (pipe) {
    opts.input = pipe;
  }

  opts.cwd = path.resolve(opts.cwd);

  /* istanbul ignore else */
  if (silent) {
    opts.stdio = 'pipe';
  } else {
    opts.stdio = 'inherit';
  }

  var c = child.spawnSync(cmd, opts);

  stdout = c.stdout || '';
  stderr = c.stderr || '';

  if (c.error) {
    code = (typeof c.error.code === 'number' ? c.error.code : 1);
  } else {
    code = c.status || 0;
  }

  if (code !== 0) {
    common.error('', code, { continue: true });
  }
  var obj = common.ShellString(stdout, stderr, code);
  return obj;
} // execSync()

// Wrapper around exec() to enable echoing output to console in real time
function execAsync(cmd, opts, pipe, callback) {
  var stdout = '';
  var stderr = '';

  opts = common.extend({
    silent: common.config.silent,
    cwd: _pwd().toString(),
    env: process.env,
    maxBuffer: DEFAULT_MAXBUFFER_SIZE,
  }, opts);

  var c = child.exec(cmd, opts, function (err) {
    if (callback) {
      if (!err) {
        callback(0, stdout, stderr);
      } else if (err.code === undefined) {
        // See issue #536
        /* istanbul ignore next */
        callback(1, stdout, stderr);
      } else {
        callback(err.code, stdout, stderr);
      }
    }
  });

  if (pipe) c.stdin.end(pipe);

  c.stdout.on('data', function (data) {
    stdout += data;
    if (!opts.silent) process.stdout.write(data);
  });

  c.stderr.on('data', function (data) {
    stderr += data;
    if (!opts.silent) process.stderr.write(data);
  });

  return c;
}

//@
//@ ### exec(command [, options] [, callback])
//@ Available options (all `false` by default):
//@
//@ + `async`: Asynchronous execution. If a callback is provided, it will be set to
//@   `true`, regardless of the passed value.
//@ + `silent`: Do not echo program output to console.
//@ + and any option available to Node.js's
//@   [child_process.exec()](https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback)
//@
//@ Examples:
//@
//@ ```javascript
//@ var version = exec('node --version', {silent:true}).stdout;
//@
//@ var child = exec('some_long_running_process', {async:true});
//@ child.stdout.on('data', function(data) {
//@   /* ... do something with data ... */
//@ });
//@
//@ exec('some_long_running_process', function(code, stdout, stderr) {
//@   console.log('Exit code:', code);
//@   console.log('Program output:', stdout);
//@   console.log('Program stderr:', stderr);
//@ });
//@ ```
//@
//@ Executes the given `command` _synchronously_, unless otherwise specified.  When in synchronous
//@ mode, this returns a ShellString (compatible with ShellJS v0.6.x, which returns an object
//@ of the form `{ code:..., stdout:... , stderr:... }`). Otherwise, this returns the child process
//@ object, and the `callback` gets the arguments `(code, stdout, stderr)`.
//@
//@ Not seeing the behavior you want? `exec()` runs everything through `sh`
//@ by default (or `cmd.exe` on Windows), which differs from `bash`. If you
//@ need bash-specific behavior, try out the `{shell: 'path/to/bash'}` option.
//@
//@ **Note:** For long-lived processes, it's best to run `exec()` asynchronously as
//@ the current synchronous implementation uses a lot of CPU. This should be getting
//@ fixed soon.
function _exec(command, options, callback) {
  options = options || {};
  if (!command) common.error('must specify command');

  var pipe = common.readFromPipe();

  // Callback is defined instead of options.
  if (typeof options === 'function') {
    callback = options;
    options = { async: true };
  }

  // Callback is defined with options.
  if (typeof options === 'object' && typeof callback === 'function') {
    options.async = true;
  }

  options = common.extend({
    silent: common.config.silent,
    async: false,
  }, options);

  try {
    if (options.async) {
      return execAsync(command, options, pipe, callback);
    } else {
      return execSync(command, options, pipe);
    }
  } catch (e) {
    common.error('internal error');
  }
}
module.exports = _exec;
