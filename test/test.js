var shell = require('..');
var common = require('../src/common');

var assert = require('assert');

shell.config.silent = true;

shell.rm('-rf', 'tmp');
shell.mkdir('tmp');

//
// Invalids
//

var result;

result = shell.test(); // no expression given
assert.ok(shell.error());

result = shell.test('asdf'); // bad expression
assert.ok(shell.error());

result = shell.test('f', 'resources/file1'); // bad expression
assert.ok(shell.error());

result = shell.test('-f'); // no file
assert.ok(shell.error());

//
// Valids
//

// exists
result = shell.test('-e', 'resources/file1');
assert.equal(shell.error(), null);
assert.equal(result, true);// true

result = shell.test('-e', 'resources/404');
assert.equal(shell.error(), null);
assert.equal(result, false);

// directory
result = shell.test('-d', 'resources');
assert.equal(shell.error(), null);
assert.equal(result, true);// true

result = shell.test('-f', 'resources');
assert.equal(shell.error(), null);
assert.equal(result, false);

result = shell.test('-L', 'resources');
assert.equal(shell.error(), null);
assert.equal(result, false);

// file
result = shell.test('-d', 'resources/file1');
assert.equal(shell.error(), null);
assert.equal(result, false);

result = shell.test('-f', 'resources/file1');
assert.equal(shell.error(), null);
assert.equal(result, true);// true

result = shell.test('-L', 'resources/file1');
assert.equal(shell.error(), null);
assert.equal(result, false);

// link
// Windows is weird with links so skip these tests
if (common.platform !== 'win') {
  result = shell.test('-d', 'resources/link');
  assert.equal(shell.error(), null);
  assert.equal(result, false);

  result = shell.test('-f', 'resources/link');
  assert.equal(shell.error(), null);
  assert.equal(result, true);// true

  result = shell.test('-L', 'resources/link');
  assert.equal(shell.error(), null);
  assert.equal(result, true);// true

  result = shell.test('-L', 'resources/badlink');
  assert.equal(shell.error(), null);
  assert.equal(result, true);// true

  result = shell.test('-L', 'resources/404');
  assert.equal(shell.error(), null);
  assert.equal(result, false);// false
}

shell.exit(123);
