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

// common.parseOptions (normal case)
var result = common.parseOptions('-Rf', {
  'R': 'recursive',
  'f': 'force',
  'r': 'reverse'
});
assert.ok(result.recursive === true);
assert.ok(result.force === true);
assert.ok(result.reverse === false);

// common.parseOptions (with mutually-negating options)
var result = common.parseOptions('-f', {
  'n': 'no_force',
  'f': '!no_force',
  'R': 'recursive'
});
assert.ok(result.recursive === false);
assert.ok(result.no_force === false);
assert.ok(result.force === undefined); // this key shouldn't exist

// common.parseOptions (the last of the conflicting options should hold)
var result = common.parseOptions('-fn', {
  'n': 'no_force',
  'f': '!no_force',
  'R': 'recursive'
});
assert.ok(result.recursive === false);
assert.ok(result.no_force === true);
assert.ok(result.force === undefined); // this key shouldn't exist

shell.exit(123);


