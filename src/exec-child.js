var childProcess = require('child_process');
var fs = require('fs');

function main() {
  var paramFilePath = process.argv[2];

  var serializedParams = fs.readFileSync(paramFilePath, 'utf8');
  var params = JSON.parse(serializedParams);

  var cmd = params.command;
  var execOptions = params.execOptions;
  var pipe = params.pipe;
  var stdoutFile = params.stdoutFile;
  var stderrFile = params.stderrFile;

  function isMaxBufferError(err) {
    var maxBufferErrorPattern = /^.*\bmaxBuffer\b.*exceeded.*$/;
    if (err instanceof Error && err.message &&
          err.message.match(maxBufferErrorPattern)) {
      // < v10
      // Error: stdout maxBuffer exceeded
      return true;
    } else if (err instanceof RangeError && err.message &&
          err.message.match(maxBufferErrorPattern)) {
      // >= v10
      // RangeError [ERR_CHILD_PROCESS_STDIO_MAXBUFFER]: stdout maxBuffer length
      // exceeded
      return true;
    }
    return false;
  }

  var stdoutStream = fs.createWriteStream(stdoutFile);
  var stderrStream = fs.createWriteStream(stderrFile);

  function appendError(message, code) {
    stderrStream.write(message);
    process.exitCode = code;
  }

  var c = childProcess.exec(cmd, execOptions, function (err) {
    if (!err) {
      process.exitCode = 0;
    } else if (isMaxBufferError(err)) {
      appendError('maxBuffer exceeded', 1);
    } else if (err.code === undefined && err.message) {
      /* istanbul ignore next */
      appendError(err.message, 1);
    } else if (err.code === undefined) {
      /* istanbul ignore next */
      appendError('Unknown issue', 1);
    } else {
      process.exitCode = err.code;
    }
  });

  c.stdout.pipe(stdoutStream);
  c.stderr.pipe(stderrStream);
  c.stdout.pipe(process.stdout);
  c.stderr.pipe(process.stderr);

  if (pipe) {
    c.stdin.end(pipe);
  }
}

// This file should only be executed. This module does not export anything.
/* istanbul ignore else */
if (require.main === module) {
  main();
}
