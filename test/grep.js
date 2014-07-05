var shell = require('..');

var assert = require('assert'),
    fs = require('fs');

shell.config.silent = true;

shell.rm('-rf', 'tmp');
shell.mkdir('tmp');

//
// Invalids
//

shell.grep();
assert.ok(shell.error());

shell.grep(/asdf/g); // too few args
assert.ok(shell.error());

assert.equal(fs.existsSync('/asdfasdf'), false); // sanity check
shell.grep(/asdf/g, '/asdfasdf'); // no such file
assert.ok(shell.error());

//
// Valids
//

var result = shell.grep('line', 'resources/a.txt');
assert.equal(shell.error(), null);
assert.equal(result.length, 4);

var result = shell.grep('-v', 'line', 'resources/a.txt');
assert.equal(shell.error(), null);
assert.equal(result.length, 8);

var result = shell.grep('line one', 'resources/a.txt');
assert.equal(shell.error(), null);
assert.deepEqual(result, ['This is line one']);

// multiple files
var result = shell.grep(/test/, 'resources/file1.txt', 'resources/file2.txt');
assert.equal(shell.error(), null);
assert.deepEqual(result, ['test1','test2']);

// multiple files, array syntax
var result = shell.grep(/test/, ['resources/file1.txt', 'resources/file2.txt']);
assert.equal(shell.error(), null);
assert.deepEqual(result, ['test1','test2']);

// multiple files, glob syntax, * for file name
var result = shell.grep(/test/, 'resources/file*.txt');
assert.equal(shell.error(), null);
assert.ok(result[0] == 'test1' && result[1] == 'test2' ||
          result[0] == 'test2' && result[1] == 'test1');

// multiple files, glob syntax, * for directory name
var result = shell.grep(/test/, '*/file*.txt');
assert.equal(shell.error(), null);
assert.ok(result[0] == 'test1' && result[1] == 'test2' ||
          result[0] == 'test2' && result[1] == 'test1');

// multiple files, glob syntax, ** for directory name
var result = shell.grep(/test/, '**/file*.js');
assert.equal(shell.error(), null);
assert.deepEqual(result, ['test','test','test','test']);

shell.exit(123);
