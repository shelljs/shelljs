var shell = require('..');

var assert = require('assert');
var util = require('util');

shell.config.silent = true;

var result;

//
// Invalids
//

shell.exec();
assert.ok(shell.error());

result = shell.exec('asdfasdf'); // could not find command
assert.ok(result.code > 0);

// Test 'fatal' mode for exec, temporarily overriding process.exit
var oldFatal = shell.config.fatal;
var oldExit = process.exit;

var exitCode = 9999;
process.exit = function quit(_exitcode) {
  exitCode = _exitcode;
};

shell.config.fatal = true;

shell.exec('asdfasdf'); // could not find command
assert.equal(exitCode, 1);

shell.config.fatal = oldFatal;
process.exit = oldExit;

//
// Valids
//

//
// sync
//

// check if stdout goes to output
result = shell.exec('node -e \"console.log(1234);\"');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.ok(
    result.stdout === '1234\n' ||
    result.stdout === '1234\nundefined\n' // 'undefined' for v0.4
);

// check if stderr goes to output
result = shell.exec('node -e \"console.error(1234);\"');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.ok(
    result.stdout === '' ||
    result.stdout === 'undefined\n' // 'undefined' for v0.4
);
assert.ok(
    result.stderr === '1234\n' ||
    result.stderr === '1234\nundefined\n' // 'undefined' for v0.4
);

// check if stdout + stderr go to output
result = shell.exec('node -e \"console.error(1234); console.log(666);\"');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.ok(
    result.stdout === '666\n' ||
    result.stdout === '666\nundefined\n' // 'undefined' for v0.4
);
assert.ok(
    result.stderr === '1234\n' ||
    result.stderr === '1234\nundefined\n' // 'undefined' for v0.4
);

// check exit code
result = shell.exec('node -e \"process.exit(12);\"');
assert.equal(shell.error(), null);
assert.equal(result.code, 12);

// interaction with cd
shell.cd('resources/external');
result = shell.exec('node node_script.js');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result.stdout, 'node_script_1234\n');
shell.cd('../..');

// check quotes escaping
result = shell.exec(util.format('node -e "console.log(%s);"', "\\\"\\'+\\'_\\'+\\'\\\""));
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result.stdout, "'+'_'+'\n");

//
// async
//

// no callback
var c = shell.exec('node -e \"console.log(1234)\"', { async: true });
assert.equal(shell.error(), null);
assert.ok('stdout' in c, 'async exec returns child process object');

var callbackTests = 3;
function done() {
  callbackTests -= 1;
  if (callbackTests === 0) {
    assert.equal(shell.error(), null);
    shell.exit(123);
  }
}

//
// callback as 2nd argument
//
shell.exec('node -e \"console.log(5678);\"', function cb1(code, stdout, stderr) {
  assert.equal(code, 0);
  assert.ok(stdout === '5678\n' || stdout === '5678\nundefined\n');  // 'undefined' for v0.4
  assert.ok(stderr === '' || stderr === 'undefined\n');  // 'undefined' for v0.4

  done();
});

//
// callback as 3rd argument
//
shell.exec('node -e \"console.log(5566);\"', { async: true }, function cb2(code, stdout, stderr) {
  assert.equal(code, 0);
  assert.ok(stdout === '5566\n' || stdout === '5566\nundefined\n');  // 'undefined' for v0.4
  assert.ok(stderr === '' || stderr === 'undefined\n');  // 'undefined' for v0.4

  done();
});

//
// callback as 3rd argument (slient:true)
//
shell.exec('node -e \"console.log(5678);\"', { silent: true }, function cb2(code, stdout, stderr) {
  assert.equal(code, 0);
  assert.ok(stdout === '5678\n' || stdout === '5678\nundefined\n');  // 'undefined' for v0.4
  assert.ok(stderr === '' || stderr === 'undefined\n');  // 'undefined' for v0.4

  done();
});
