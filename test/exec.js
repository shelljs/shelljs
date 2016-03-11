var shell = require('..');

var assert = require('assert');
var util = require('util');
var path = require('path');
var os = require('os');

shell.config.silent = true;

//
// Invalids
//

shell.exec();
assert.ok(shell.error());

var result = shell.exec('asdfasdf'); // could not find command
assert.ok(result.code > 0);

// Test 'fatal' mode for exec, temporarily overriding process.exit
var old_fatal = shell.config.fatal;

shell.config.fatal = true;

assert.throws(function() {
  shell.exec('asdfasdf'); // could not find command
}, /exec: internal error/);

shell.config.fatal = old_fatal;

//
// Valids
//

//
// sync
//

// check if stdout goes to output
var result = shell.exec(JSON.stringify(process.execPath)+' -e \"console.log(1234);\"');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.ok(result.stdout === '1234\n' || result.stdout === '1234\nundefined\n'); // 'undefined' for v0.4

// check if stderr goes to output
var result = shell.exec(JSON.stringify(process.execPath)+' -e \"console.error(1234);\"');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.ok(result.stdout === '' || result.stdout === 'undefined\n'); // 'undefined' for v0.4
assert.ok(result.stderr === '1234\n' || result.stderr === '1234\nundefined\n'); // 'undefined' for v0.4

// check if stdout + stderr go to output
var result = shell.exec(JSON.stringify(process.execPath)+' -e \"console.error(1234); console.log(666);\"');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.ok(result.stdout === '666\n' || result.stdout === '666\nundefined\n');  // 'undefined' for v0.4
assert.ok(result.stderr === '1234\n' || result.stderr === '1234\nundefined\n');  // 'undefined' for v0.4

// check exit code
var result = shell.exec(JSON.stringify(process.execPath)+' -e \"process.exit(12);\"');
assert.ok(shell.error());
assert.equal(result.code, 12);

// interaction with cd
shell.cd('resources/external');
var result = shell.exec(JSON.stringify(process.execPath)+' node_script.js');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result.stdout, 'node_script_1234\n');
shell.cd('../..');

// check quotes escaping
var result = shell.exec( util.format(JSON.stringify(process.execPath)+' -e "console.log(%s);"', "\\\"\\'+\\'_\\'+\\'\\\"") );
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result.stdout, "'+'_'+'\n");

// set cwd
var cmdString = process.platform === 'win32' ? 'cd' : 'pwd';
result = shell.exec(cmdString, {cwd: '..'});
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result.stdout, path.resolve('..') + os.EOL);

// set maxBuffer (very small)
result = shell.exec('echo 1234567890'); // default maxBuffer is ok
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result.stdout, '1234567890' + os.EOL);
if (process.version >= 'v0.11') { // this option doesn't work on v0.10
  shell.exec('echo 1234567890', {maxBuffer: 6});
  assert.ok(shell.error());
}

// set timeout option
result = shell.exec(JSON.stringify(process.execPath)+' resources/exec/slow.js 100'); // default timeout is ok
assert.ok(!shell.error());
assert.equal(result.code, 0);
if (process.version >= 'v0.11') { // this option doesn't work on v0.10
  result = shell.exec(JSON.stringify(process.execPath)+' resources/exec/slow.js 100', {timeout: 10}); // times out
  assert.ok(shell.error());
}

// check process.env works
assert.ok(!shell.env.FOO);
shell.env.FOO = 'Hello world';
result = shell.exec(process.platform !== 'win32' ? 'echo $FOO' : 'echo %FOO%');
assert.ok(!shell.error());
assert.equal(result.code, 0);
assert.equal(result.stdout, 'Hello world' + os.EOL);
assert.equal(result.stderr, '');

// set shell option (TODO: add tests for Windows)
if (process.platform !== 'win32') {
  result = shell.exec('echo $0');
  assert.ok(!shell.error());
  assert.equal(result.code, 0);
  assert.equal(result.stdout, '/bin/sh\n'); // sh by default
  var bashPath = shell.which('bash').trim();
  // this option doesn't work on v0.10
  if (bashPath && process.version >= 'v0.11') {
    result = shell.exec('echo $0', {shell: '/bin/bash'});
    assert.ok(!shell.error());
    assert.equal(result.code, 0);
    assert.equal(result.stdout, '/bin/bash\n');
  }
}

// exec returns a ShellString
result = shell.exec('echo foo');
assert.ok(typeof result === 'object');
assert.ok(result instanceof String);
assert.ok(typeof result.stdout === 'string');
assert.strictEqual(result.toString(), result.stdout);

//
// async
//

// no callback
var c = shell.exec(JSON.stringify(process.execPath)+' -e \"console.log(1234)\"', {async:true});
assert.equal(shell.error(), null);
assert.ok('stdout' in c, 'async exec returns child process object');

//
// callback as 2nd argument
//
shell.exec(JSON.stringify(process.execPath)+' -e \"console.log(5678);\"', function(code, stdout, stderr) {
  assert.equal(code, 0);
  assert.ok(stdout === '5678\n' || stdout === '5678\nundefined\n');  // 'undefined' for v0.4
  assert.ok(stderr === '' || stderr === 'undefined\n');  // 'undefined' for v0.4

  //
  // callback as 3rd argument
  //
  shell.exec(JSON.stringify(process.execPath)+' -e \"console.log(5566);\"', {async:true}, function(code, stdout, stderr) {
    assert.equal(code, 0);
    assert.ok(stdout === '5566\n' || stdout === '5566\nundefined\n');  // 'undefined' for v0.4
    assert.ok(stderr === '' || stderr === 'undefined\n');  // 'undefined' for v0.4

    //
    // callback as 3rd argument (slient:true)
    //
    shell.exec(JSON.stringify(process.execPath)+' -e \"console.log(5678);\"', {silent:true}, function(code, stdout, stderr) {
      assert.equal(code, 0);
      assert.ok(stdout === '5678\n' || stdout === '5678\nundefined\n');  // 'undefined' for v0.4
      assert.ok(stderr === '' || stderr === 'undefined\n');  // 'undefined' for v0.4

      shell.exit(123);

    });

  });

});

assert.equal(shell.error(), null);
