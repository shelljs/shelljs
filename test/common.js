var shell = require('..');
var common = require('../src/common');

var assert = require('assert');

shell.config.silent = true;

shell.rm('-rf', 'tmp');
shell.mkdir('tmp');

//
// Invalids
//

// too few args
assert.throws(function () {
  common.expand();
}, TypeError);

// should be a list
assert.throws(function () {
  common.expand("resources");
}, TypeError);

//
// Valids
//

// single file, array syntax
var result = common.expand(['resources/file1.txt']);
assert.equal(shell.error(), null);
assert.deepEqual(result, ['resources/file1.txt']);

// multiple file, glob syntax, * for file name
var result = common.expand(['resources/file*.txt']);
assert.equal(shell.error(), null);
assert.deepEqual(result, ['resources/file1.txt', 'resources/file2.txt']);

// multiple file, glob syntax, * for directory name
var result = common.expand(['*/file*.txt']);
assert.equal(shell.error(), null);
assert.deepEqual(result, ['resources/file1.txt', 'resources/file2.txt']);

// multiple file, glob syntax, ** for directory name
var result = common.expand(['**/file*.txt']);
assert.equal(shell.error(), null);
assert.deepEqual(result, ['resources/file1.txt', 'resources/file2.txt']);

shell.exit(123);


