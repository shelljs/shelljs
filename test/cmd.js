var shell = require('..');

var assert = require('assert');
var path = require('path');
var os = require('os');

shell.config.silent = true;

//
// Invalids
//

shell.cmd();
assert.ok(shell.error());

var result = shell.cmd('asdfasdf'); // could not find command
assert.notEqual(result.code, 0);

// Test 'fatal' mode for cmd, temporarily overriding process.exit
var oldFatal = shell.config.fatal;

shell.config.fatal = true;

assert.throws(function () {
  shell.cmd('asdfasdf'); // could not find command
}, /cmd: internal error/);

shell.config.fatal = oldFatal;

//
// Valids
//

//
// sync
//

// check if stdout goes to output
result = shell.cmd(process.execPath, '-e', 'console.log(1234);');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result.stdout, '1234\n');

// check if stderr goes to output
result = shell.cmd(process.execPath, '-e', 'console.error(1234);');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result.stdout, '');
assert.equal(result.stderr, '1234\n');

// check if stdout + stderr go to output
result = shell.cmd(process.execPath, '-e', 'console.error(1234); console.log(666);');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result.stdout, '666\n');
assert.equal(result.stderr, '1234\n');

// check exit code
result = shell.cmd(process.execPath, '-e', 'process.exit(12);');
assert.ok(shell.error());
assert.equal(result.code, 12);

// interaction with cd
shell.cd('resources/external');
result = shell.cmd(process.execPath, 'node_script.js');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result.stdout, 'node_script_1234\n');
shell.cd('../..');

// set cwd
var cmdString = process.platform === 'win32' ? 'cd' : 'pwd';
result = shell.cmd(cmdString, { cwd: '..' });
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result.stdout, path.resolve('..') + os.EOL);

// supports globbing by default
result = shell.cmd('echo', 'resources/*.txt');
assert.equal(result.stdout, 'resources/a.txt resources/file1.txt resources/file2.txt\n');
assert.equal(result.stderr, '');
assert.ok(!shell.error());

// globbing can be disabled
shell.set('-f');
result = shell.cmd('echo', 'resources/*.txt');
assert.equal(result.stdout, 'resources/*.txt\n');
assert.equal(result.stderr, '');
assert.ok(!shell.error());
shell.set('+f');

// cmd returns a ShellString
result = shell.cmd('echo', 'foo');
assert.equal(typeof result, 'object');
assert.ok(result instanceof String);
assert.equal(typeof result.stdout, 'string');
assert.strictEqual(result.toString(), result.stdout);

// TODO(nate): make it exactly equivalent to stderr, unless stderr === ''
// shell.error() contains the stderr of external command in the case of an error
result = shell.cmd(process.execPath, '-e', 'console.error(1234); process.exit(1);');
assert.equal(shell.error(), 'cmd: ' + result.stderr);
assert.equal(result.code, 1);
assert.equal(result.stdout, '');
assert.equal(result.stderr, '1234\n');

// option: realtimeOutput === false
result = shell.cmd(process.execPath, '-e', 'console.error(1234); console.log(5678);', {
  realtimeOutput: false
});
assert.ok(!shell.error());
assert.equal(result.code, 0);
assert.equal(result.stdout, '5678\n');
assert.equal(result.stderr, '1234\n');

// cmd works, even if it's piped while in silent mode
result = shell.ShellString('foo bar baz').cmd('cat', { silent: true });
assert.equal(typeof result, 'object');
assert.ok(result instanceof String);
assert.equal(result.stdout, 'foo bar baz');

shell.exit(123);
