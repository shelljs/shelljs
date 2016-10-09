var childProcess = require('child_process');
var fs = require('fs');

var stdoutFile = process.argv[2];
var stderrFile = process.argv[3];
var cmd = process.argv[4];
var argString = process.argv[5];
var optString = process.argv[6];
var pipe = process.argv[7];

var opts = JSON.parse(optString);
var args = JSON.parse(argString);

var c = childProcess.spawn(cmd, args, opts);

// Wait to exit until all other work has been finished, like closing IO streams
function delayedExit(code) {
  setTimeout(function () {
    process.exit(code); // let streams close before ending
  }, 0);
}

c.on('error', function () {
  delayedExit(127);
});

c.on('exit', function (code) {
  delayedExit(code);
});

var stdoutStream = fs.createWriteStream(stdoutFile);
var stderrStream = fs.createWriteStream(stderrFile);
c.stdout.pipe(stdoutStream, { end: false });
c.stderr.pipe(stderrStream, { end: false });

if (!opts.silent) {
  c.stdout.pipe(process.stdout);
  c.stderr.pipe(process.stderr);
}

c.stdout.on('end', stdoutStream.end);
c.stderr.on('end', stderrStream.end);

// Handle piped input
if (pipe) c.stdin.end(pipe);
