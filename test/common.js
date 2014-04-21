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
assert.deepEqual(result.sort(), ['resources/file1.txt', 'resources/file2.txt'].sort());

// multiple file, glob syntax, * for directory name
var result = common.expand(['*/file*.txt']);
assert.equal(shell.error(), null);
assert.deepEqual(result.sort(), ['resources/file1.txt', 'resources/file2.txt'].sort());

// multiple file, glob syntax, ** for directory name
var result = common.expand(['**/file*.js']);
assert.equal(shell.error(), null);
assert.deepEqual(result.sort(), ["resources/file1.js","resources/file2.js","resources/ls/file1.js","resources/ls/file2.js"].sort());

shell.exit(123);


