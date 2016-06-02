var shell = require('..');

var assert = require('assert');
var fs = require('fs');

shell.config.silent = true;

shell.rm('-rf', 'tmp');
shell.mkdir('tmp');

var result;

//
// Invalids
//

result = shell.tail();
assert.ok(shell.error());
assert.equal(result.code, 1);

assert.equal(fs.existsSync('/asdfasdf'), false); // sanity check
result = shell.tail('/adsfasdf'); // file does not exist
assert.ok(shell.error());
assert.equal(result.code, 1);

//
// Valids
//

var bottomOfFile1 = ['file1 50', 'file1 49', 'file1 48', 'file1 47', 'file1 46',
                     'file1 45', 'file1 44', 'file1 43', 'file1 42', 'file1 41',
                     'file1 40', 'file1 39', 'file1 38', 'file1 37', 'file1 36',
                     'file1 35', 'file1 34', 'file1 33', 'file1 32', 'file1 31'];
var bottomOfFile2 = ['file2 50', 'file2 49', 'file2 48', 'file2 47', 'file2 46',
                     'file2 45', 'file2 44', 'file2 43', 'file2 42', 'file2 41',
                     'file2 40', 'file2 39', 'file2 38', 'file2 37', 'file2 36',
                     'file2 35', 'file2 34', 'file2 33', 'file2 32', 'file2 31'];

// simple
result = shell.tail('resources/head/file1.txt');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result, bottomOfFile1.slice(0, 10).reverse().join('\n')+'\n');

// multiple files
result = shell.tail('resources/head/file2.txt', 'resources/head/file1.txt');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result, bottomOfFile2.slice(0, 10).reverse().concat(
                         bottomOfFile1.slice(0, 10).reverse()
                     ).join('\n')+'\n');

// multiple files, array syntax
result = shell.tail(['resources/head/file2.txt', 'resources/head/file1.txt']);
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result, bottomOfFile2.slice(0, 10).reverse().concat(
                         bottomOfFile1.slice(0, 10).reverse()
                     ).join('\n')+'\n');

// reading more lines than are in the file (no trailing newline)
result = shell.tail('resources/file2', 'resources/file1');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result, 'test2\ntest1'); // these files only have one line (no \n)

// reading more lines than are in the file (with trailing newline)
result = shell.tail('resources/head/shortfile2', 'resources/head/shortfile1');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result, 'short2\nshort1\n'); // these files only have one line (with \n)

// Globbed file
result = shell.tail('resources/head/file?.txt');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result, bottomOfFile1.slice(0, 10).reverse().concat(
                         bottomOfFile2.slice(0, 10).reverse()
                     ).join('\n')+'\n');

// With `'-n' <num>` option
result = shell.tail('-n', 4, 'resources/head/file2.txt', 'resources/head/file1.txt');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result, bottomOfFile2.slice(0, 4).reverse().concat(
                         bottomOfFile1.slice(0, 4).reverse()
                     ).join('\n')+'\n');

// With `{'-n': <num>}` option
result = shell.tail({'-n': 4}, 'resources/head/file2.txt', 'resources/head/file1.txt');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result, bottomOfFile2.slice(0, 4).reverse().concat(
                         bottomOfFile1.slice(0, 4).reverse()
                     ).join('\n')+'\n');

// negative values are the same as positive values
result = shell.tail('-n', -4, 'resources/head/file2.txt', 'resources/head/file1.txt');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result, bottomOfFile2.slice(0, 4).reverse().concat(
                         bottomOfFile1.slice(0, 4).reverse()
                     ).join('\n')+'\n');

shell.exit(123);
