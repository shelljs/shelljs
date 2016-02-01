var shell = require('..');

var assert = require('assert');

var oldConfigSilent = shell.config.silent;
shell.config.silent = true;

shell.rm('-rf', 'tmp');
shell.mkdir('tmp');

var result;
//
// Valids
//

// initial values
assert.strictEqual(oldConfigSilent, false);
assert.strictEqual(shell.config.verbose, false);
assert.strictEqual(shell.config.fatal, false);

// default behavior
result = shell.exec('node -e \"require(\'../global\'); ls(\'file_doesnt_exist\'); echo(1234);\"');
assert.equal(result.code, 0);
assert.equal(result.stdout, '1234\n');
assert.equal(result.stderr, 'ls: no such file or directory: file_doesnt_exist\n');

// set -e
result = shell.exec(
  'node -e \"require(\'../global\'); set(\'-e\'); ls(\'file_doesnt_exist\'); echo(1234);\"'
);
assert.equal(result.code, 1);
assert.equal(result.stdout, '');
assert.equal(result.stderr, 'ls: no such file or directory: file_doesnt_exist\n');

// set -v
result = shell.exec(
  'node -e \"require(\'../global\'); set(\'-v\'); ls(\'file_doesnt_exist\'); echo(1234);\"'
);
assert.equal(result.code, 0);
assert.equal(result.stdout, 'ls file_doesnt_exist\n1234\n');
assert.equal(result.stderr, 'ls: no such file or directory: file_doesnt_exist\n');

// set -ev
result = shell.exec(
  'node -e \"require(\'../global\'); set(\'-ev\'); ls(\'file_doesnt_exist\'); echo(1234);\"'
);
assert.equal(result.code, 1);
assert.equal(result.stdout, 'ls file_doesnt_exist\n');
assert.equal(result.stderr, 'ls: no such file or directory: file_doesnt_exist\n');

// set -e, set +e
result = shell.exec(
  'node -e \"require(\'../global\');' +
  'set(\'-e\'); set(\'+e\');' +
  'ls(\'file_doesnt_exist\');' +
  'echo(1234);\"'
);
assert.equal(result.code, 0);
assert.equal(result.stdout, '1234\n');
assert.equal(result.stderr, 'ls: no such file or directory: file_doesnt_exist\n');

shell.exit(123);
