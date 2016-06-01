var shell = require('..');

var assert = require('assert');

var oldConfigSilent = shell.config.silent;
shell.config.silent = true;

shell.rm('-rf', 'tmp');

//
// Valids
//

var result;

// initial values
assert.strictEqual(oldConfigSilent, false);
assert.strictEqual(shell.config.verbose, false);
assert.strictEqual(shell.config.fatal, false);
assert.strictEqual(shell.config.noglob, false);

shell.cp('-R', 'resources/', 'tmp');

// default behavior
result = shell.exec(JSON.stringify(process.execPath)+' -e \"require(\'../global\'); ls(\'file_doesnt_exist\'); echo(1234);\"');
assert.equal(result.code, 0);
assert.equal(result.stdout, '1234\n');
assert.equal(result.stderr, 'ls: no such file or directory: file_doesnt_exist\n');

// set -e
result = shell.exec(JSON.stringify(process.execPath)+' -e \"require(\'../global\'); set(\'-e\'); ls(\'file_doesnt_exist\'); echo(1234);\"');
var nodeVersion = process.versions.node.split('.').map(function(str) { return parseInt(str, 10); });
var uncaughtErrorExitCode = (nodeVersion[0] === 0 && nodeVersion[1] < 11) ? 8 : 1;
assert.equal(result.code, uncaughtErrorExitCode);
assert.equal(result.stdout, '');
assert(result.stderr.indexOf('Error: ls: no such file or directory: file_doesnt_exist') >= 0);

// set -v
result = shell.exec(JSON.stringify(process.execPath)+' -e \"require(\'../global\'); set(\'-v\'); ls(\'file_doesnt_exist\'); echo(1234);\"');
assert.equal(result.code, 0);
assert.equal(result.stdout, '1234\n');
assert.equal(result.stderr, 'ls file_doesnt_exist\nls: no such file or directory: file_doesnt_exist\necho 1234\n');

// set -ev
result = shell.exec(JSON.stringify(process.execPath)+' -e \"require(\'../global\'); set(\'-ev\'); ls(\'file_doesnt_exist\'); echo(1234);\"');
assert.equal(result.code, uncaughtErrorExitCode);
assert.equal(result.stdout, '');
assert(result.stderr.indexOf('Error: ls: no such file or directory: file_doesnt_exist') >= 0);
assert(result.stderr.indexOf('ls file_doesnt_exist\n') >= 0);
assert.equal(result.stderr.indexOf('echo 1234\n'), -1);

// set -e, set +e
result = shell.exec(JSON.stringify(process.execPath)+' -e \"require(\'../global\'); set(\'-e\'); set(\'+e\'); ls(\'file_doesnt_exist\'); echo(1234);\"');
assert.equal(result.code, 0);
assert.equal(result.stdout, '1234\n');
assert.equal(result.stderr, 'ls: no such file or directory: file_doesnt_exist\n');

// set -f
shell.set('-f'); // disable globbing
shell.rm('tmp/*.txt');
assert.ok(shell.error()); // file '*.txt' doesn't exist, so rm() fails
shell.set('+f');
shell.rm('tmp/*.txt');
assert.ok(!shell.error()); // globbing works, so rm succeeds

shell.exit(123);


