var common = require('./common');
var _tempDir = require('./tempdir');
var _pwd = require('./pwd');
var path = require('path');
var fs = require('fs');
var child = require('child_process');

// Hack to run child_process.exec() synchronously (sync avoids callback hell)
// Uses a custom wait loop that checks for a flag file, created when the child process is done.
// (Can't do a wait loop that checks for internal Node variables/messages as
// Node is single-threaded; callbacks and other internal state changes are done in the
// event loop).
function execSync(cmd, opts) {
  var tempDir = _tempDir();
  var stdoutFile = path.resolve(tempDir+'/'+common.randomFileName()),
      stderrFile = path.resolve(tempDir+'/'+common.randomFileName()),
      codeFile = path.resolve(tempDir+'/'+common.randomFileName()),
      scriptFile = path.resolve(tempDir+'/'+common.randomFileName()),
      sleepFile = path.resolve(tempDir+'/'+common.randomFileName());

  var options = common.extend({
    silent: common.config.silent
  }, opts);

  var previousStdoutContent = '',
      previousStderrContent = '';
  // Echoes stdout and stderr changes from running process, if not silent
  function updateStream(streamFile) {
    if (options.silent || !fs.existsSync(streamFile))
      return;

    var previousStreamContent,
        proc_stream;
    if (streamFile === stdoutFile) {
      previousStreamContent = previousStdoutContent;
      proc_stream = process.stdout;
    } else { // assume stderr
      previousStreamContent = previousStderrContent;
      proc_stream = process.stderr;
    }

    var streamContent = fs.readFileSync(streamFile, 'utf8');
    // No changes since last time?
    if (streamContent.length <= previousStreamContent.length)
      return;

    proc_stream.write(streamContent.substr(previousStreamContent.length));
    previousStreamContent = streamContent;
  }

  function escape(str) {
    return (str+'').replace(/([\\"'])/g, "\\$1").replace(/\0/g, "\\0");
  }

  if (fs.existsSync(scriptFile)) common.unlinkSync(scriptFile);
  if (fs.existsSync(stdoutFile)) common.unlinkSync(stdoutFile);
  if (fs.existsSync(stderrFile)) common.unlinkSync(stderrFile);
  if (fs.existsSync(codeFile)) common.unlinkSync(codeFile);

  var execCommand = '"'+process.execPath+'" '+scriptFile;
  var execOptions = {
    env: process.env,
    cwd: _pwd(),
    maxBuffer: 20*1024*1024
  };

  var script;

  if (typeof child.execSync === 'function') {
    script = [
      "var child = require('child_process')",
      "  , fs = require('fs');",
      "var childProcess = child.exec('"+escape(cmd)+"', {env: process.env, maxBuffer: 20*1024*1024}, function(err) {",
      "  fs.writeFileSync('"+escape(codeFile)+"', err ? err.code.toString() : '0');",
      "});",
      "var stdoutStream = fs.createWriteStream('"+escape(stdoutFile)+"');",
      "var stderrStream = fs.createWriteStream('"+escape(stderrFile)+"');",
      "childProcess.stdout.pipe(stdoutStream, {end: false});",
      "childProcess.stderr.pipe(stderrStream, {end: false});",
      "childProcess.stdout.pipe(process.stdout);",
      "childProcess.stderr.pipe(process.stderr);",
      "var stdoutEnded = false, stderrEnded = false;",
      "function tryClosingStdout(){ if(stdoutEnded){ stdoutStream.end(); } }",
      "function tryClosingStderr(){ if(stderrEnded){ stderrStream.end(); } }",
      "childProcess.stdout.on('end', function(){ stdoutEnded = true; tryClosingStdout(); });",
      "childProcess.stderr.on('end', function(){ stderrEnded = true; tryClosingStderr(); });"
    ].join('\n');

    fs.writeFileSync(scriptFile, script);

    if (options.silent) {
      execOptions.stdio = 'ignore';
    } else {
      execOptions.stdio = [0, 1, 2];
    }

    // Welcome to the future
    child.execSync(execCommand, execOptions);
  } else {
    cmd += ' > '+stdoutFile+' 2> '+stderrFile; // works on both win/unix

    script = [
      "var child = require('child_process')",
      "  , fs = require('fs');",
      "var childProcess = child.exec('"+escape(cmd)+"', {env: process.env, maxBuffer: 20*1024*1024}, function(err) {",
      "  fs.writeFileSync('"+escape(codeFile)+"', err ? err.code.toString() : '0');",
      "});"
    ].join('\n');

    fs.writeFileSync(scriptFile, script);

    child.exec(execCommand, execOptions);

    // The wait loop
    // sleepFile is used as a dummy I/O op to mitigate unnecessary CPU usage
    // (tried many I/O sync ops, writeFileSync() seems to be only one that is effective in reducing
    // CPU usage, though apparently not so much on Windows)
    while (!fs.existsSync(codeFile)) { updateStream(stdoutFile); fs.writeFileSync(sleepFile, 'a'); }
    while (!fs.existsSync(stdoutFile)) { updateStream(stdoutFile); fs.writeFileSync(sleepFile, 'a'); }
    while (!fs.existsSync(stderrFile)) { updateStream(stderrFile); fs.writeFileSync(sleepFile, 'a'); }
  }

  // At this point codeFile exists, but it's not necessarily flushed yet.
  // Keep reading it until it is.
  var code = parseInt('', 10);
  while (isNaN(code)) {
    code = parseInt(fs.readFileSync(codeFile, 'utf8'), 10);
  }

  var stdout = fs.readFileSync(stdoutFile, 'utf8');
  var stderr = fs.readFileSync(stderrFile, 'utf8');

  // No biggie if we can't erase the files now -- they're in a temp dir anyway
  try { common.unlinkSync(scriptFile); } catch(e) {}
  try { common.unlinkSync(stdoutFile); } catch(e) {}
  try { common.unlinkSync(stderrFile); } catch(e) {}
  try { common.unlinkSync(codeFile); } catch(e) {}
  try { common.unlinkSync(sleepFile); } catch(e) {}

  // some shell return codes are defined as errors, per http://tldp.org/LDP/abs/html/exitcodes.html
  if (code === 1 || code === 2 || code >= 126)  {
      common.error('', true); // unix/shell doesn't really give an error message after non-zero exit codes
  }
  // True if successful, false if not
  var obj = {
    code: code,
    output: stdout, // deprecated
    stdout: stdout,
    stderr: stderr
  };
  return obj;
} // execSync()

// Wrapper around exec() to enable echoing output to console in real time
function execAsync(cmd, opts, callback) {
  var stdout = '';
  var stderr = '';

  var options = common.extend({
    silent: common.config.silent
  }, opts);

  var c = child.exec(cmd, {env: process.env, maxBuffer: 20*1024*1024}, function(err) {
    if (callback)
      callback(err ? err.code : 0, stdout, stderr);
  });

  c.stdout.on('data', function(data) {
    stdout += data;
    if (!options.silent)
      process.stdout.write(data);
  });

  c.stderr.on('data', function(data) {
    stderr += data;
    if (!options.silent)
      process.stderr.write(data);
  });

  return c;
}

// Wrapper for series execAsync() running
function series (cmds, opts, callback) {
  var out = '';

  var next = function(output) {
    execAsync(cmds.shift(), opts, function(code, output) {
      if (code) return callback(code, null);
      out += output;

      return cmds.length ? next(out) : callback(code, out);
    });
  };
  next();  
}

//@
//@ ### exec(command [, options] [, callback])
//@ Available options (all `false` by default):
//@
//@ + `async`: Asynchronous execution. If a callback is provided, it will be set to
//@   `true`, regardless of the passed value.
//@ + `silent`: Do not echo program output to console.
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
//@ mode returns the object `{ code:..., stdout:... , stderr:... }`, containing the program's
//@ `stdout`, `stderr`, and its exit `code`. Otherwise returns the child process object,
//@ and the `callback` gets the arguments `(code, stdout, stderr)`.
//@
//@ **Note:** For long-lived processes, it's best to run `exec()` asynchronously as
//@ the current synchronous implementation uses a lot of CPU. This should be getting
//@ fixed soon.
function _exec(command, options, callback) {
  if (!command)
    common.error('must specify command');

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
    async: false
  }, options);

  if (command instanceof Array && callback) {
    return series(command, options, callback);
  }

  if (options.async)
    return execAsync(command, options, callback);
  else
    return execSync(command, options);
}
module.exports = _exec;
