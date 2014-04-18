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
assert.equal(result.split('\n').length - 1, 4);

var result = shell.grep('-v', 'line', 'resources/a.txt');
assert.equal(shell.error(), null);
assert.equal(result.split('\n').length - 1, 8);

var result = shell.grep('line one', 'resources/a.txt');
assert.equal(shell.error(), null);
assert.equal(result, 'This is line one\n');

// multiple files
var result = shell.grep(/test/, 'resources/file1.txt', 'resources/file2.txt');
assert.equal(shell.error(), null);
assert.equal(result, 'test1\ntest2\n');

// multiple files, array syntax
var result = shell.grep(/test/, ['resources/file1.txt', 'resources/file2.txt']);
assert.equal(shell.error(), null);
assert.equal(result, 'test1\ntest2\n');

// multiple files, glob syntax, * for file name
var result = shell.grep(/test/, 'resources/file*.txt');
assert.equal(shell.error(), null);
assert.ok(result == 'test1\ntest2\n' || result == 'test2\ntest1\n');

// multiple files, glob syntax, * for directory name
var result = shell.grep(/test/, '*/file*.txt');
assert.equal(shell.error(), null);
assert.ok(result == 'test1\ntest2\n' || result == 'test2\ntest1\n');

// multiple files, glob syntax, ** for directory name
var result = shell.grep(/test/, '**/file*.js');
assert.equal(shell.error(), null);
assert.equal(result, 'test\ntest\ntest\ntest\n');

// list file names of matches
var result = shell.grep('-l', /test/, ['resources/file1.txt', 'resources/file2.txt']);
assert.equal(shell.error(), null);
assert.equal(result, 'resources/file1.txt\nresources/file2.txt\n');

// glob (and -s to silence missing files found via glob)
shell.cd('./resources');
var result = shell.grep('-s', /test/, '*');
assert.equal(shell.error(), null);
assert.equal(result, 'test1\ntest\ntest1\ntest2\ntest\ntest2\n');
shell.cd('..');

// glob (and -s to silence missing files found via glob)
shell.cd('./resources');
var result = shell.grep('-s', /test/, '*');
assert.equal(shell.error(), null);
assert.equal(result, 'test1\ntest\ntest1\ntest2\ntest\ntest2\n');

// glob listing file names of matches
shell.cd('./resources');
var result = shell.grep('-ls', /test/, '*');
assert.equal(shell.error(), null);
assert.equal(result, "file1\nfile1.js\nfile1.txt\nfile2\nfile2.js\nfile2.txt\n");


shell.exit(123);
