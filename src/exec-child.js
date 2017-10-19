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
var codeFile = params.codeFile;

var c = childProcess.exec(cmd, execOptions, function (err) {
  if (!err) {
    fs.writeFileSync(codeFile, '0');
  } else if (err.code === undefined) {
    fs.writeFileSync(codeFile, '1');
  } else {
    fs.writeFileSync(codeFile, err.code.toString());
  }
});

var stdoutStream = fs.createWriteStream(stdoutFile);
var stderrStream = fs.createWriteStream(stderrFile);

c.stdout.pipe(stdoutStream, { end: false });
c.stderr.pipe(stderrStream, { end: false });
c.stdout.pipe(process.stdout);
c.stderr.pipe(process.stderr);

if (pipe) {
  c.stdin.end(pipe);
}

c.stdout.on('end', stdoutStream.end);
c.stderr.on('end', stderrStream.end);
