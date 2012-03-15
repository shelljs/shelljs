var shell = require('..');

var assert = require('assert'),
    path = require('path'),
    fs = require('fs');

// Node shims for < v0.7
fs.existsSync = fs.existsSync || path.existsSync;

shell.silent(true);

shell.rm('-rf', 'tmp');
shell.mkdir('tmp')

//
// Invalids
//

var result = shell.test(); // no expression given
assert.ok(shell.error());

var result = shell.test('asdf'); // bad expression
assert.ok(shell.error());

var result = shell.test('f', 'resources/file1'); // bad expression
assert.ok(shell.error());

var result = shell.test('-f'); // no file
assert.ok(shell.error());

//
// Valids
//

var result = shell.test('-f', 'resources/file1');
assert.equal(shell.error(), null);
assert.equal(result, true);

var result = shell.test('-d', 'resources/file1');
assert.equal(shell.error(), null);
assert.equal(result, false);

var result = shell.test('-f', 'resources');
assert.equal(shell.error(), null);
assert.equal(result, false);

var result = shell.test('-d', 'resources');
assert.equal(shell.error(), null);
assert.equal(result, true);

shell.exit(123);
