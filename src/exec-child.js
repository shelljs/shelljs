if (require.main !== module) {
  throw new Error('This file should not be required');
}

var childProcess = require('child_process');
var fs = require('fs');

// Note: this will break if `paramFilePath` contains special characters ( '\n',
// '\t', etc.). Such characters are possible if $TMP gets modified. We already
// rely on tempdir() to work for other things, so this is an acceptable risk.
var paramFilePath = process.argv[2];

var serializedParams = fs.readFileSync(paramFilePath, 'utf8');
var params = JSON.parse(serializedParams);

var cmd = params.command;
var execOptions = params.execOptions;
var pipe = params.pipe;
var stdoutFile = params.stdoutFile;
var stderrFile = params.stderrFile;

var c;
try {
  c = childProcess.exec(cmd, execOptions, function (err) {
    if (!err) {
      process.exitCode = 0;
    } else if (err.code === undefined) {
      process.exitCode = 1;
    } else {
      process.exitCode = err.code;
    }
  });
} catch (e) {
  // child_process could not run the command.
  process.exitCode = 127;
}

var stdoutStream = fs.createWriteStream(stdoutFile);
var stderrStream = fs.createWriteStream(stderrFile);

c.stdout.pipe(stdoutStream);
c.stderr.pipe(stderrStream);
c.stdout.pipe(process.stdout);
c.stderr.pipe(process.stderr);

if (pipe) {
  c.stdin.end(pipe);
}
