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

result = shell.head();
assert.ok(shell.error());
assert.equal(result.code, 1);

assert.equal(fs.existsSync('/asdfasdf'), false); // sanity check
result = shell.head('/adsfasdf'); // file does not exist
assert.ok(shell.error());
assert.equal(result.code, 1);

//
// Valids
//

var topOfFile1 = ['file1 1',  'file1 2',  'file1 3',  'file1 4',  'file1 5',
                  'file1 6',  'file1 7',  'file1 8',  'file1 9',  'file1 10',
                  'file1 11', 'file1 12', 'file1 13', 'file1 14', 'file1 15',
                  'file1 16', 'file1 17', 'file1 18', 'file1 19', 'file1 20'];
var topOfFile2 = ['file2 1',  'file2 2',  'file2 3',  'file2 4',  'file2 5',
                  'file2 6',  'file2 7',  'file2 8',  'file2 9',  'file2 10',
                  'file2 11', 'file2 12', 'file2 13', 'file2 14', 'file2 15',
                  'file2 16', 'file2 17', 'file2 18', 'file2 19', 'file2 20'];

// simple
result = shell.head('resources/head/file1.txt');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result, topOfFile1.slice(0, 10).join('\n')+'\n');

// multiple files
result = shell.head('resources/head/file2.txt', 'resources/head/file1.txt');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result, topOfFile2.slice(0, 10).concat(
                         topOfFile1.slice(0, 10)
                     ).join('\n')+'\n');

// multiple files, array syntax
result = shell.head(['resources/head/file2.txt', 'resources/head/file1.txt']);
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result, topOfFile2.slice(0, 10).concat(
                         topOfFile1.slice(0, 10)
                     ).join('\n')+'\n');

// reading more lines than are in the file (no trailing newline)
result = shell.head('resources/file2', 'resources/file1');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result, 'test2\ntest1'); // these files only have one line (no \n)

// reading more lines than are in the file (with trailing newline)
result = shell.head('resources/head/shortfile2', 'resources/head/shortfile1');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result, 'short2\nshort1\n'); // these files only have one line (with \n)

// Globbed file
result = shell.head('resources/head/file?.txt');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result, topOfFile1.slice(0, 10).concat(
                         topOfFile2.slice(0, 10)
                     ).join('\n')+'\n');

// With `'-n' <num>` option
result = shell.head('-n', 4, 'resources/head/file2.txt', 'resources/head/file1.txt');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result, topOfFile2.slice(0, 4).concat(
                         topOfFile1.slice(0, 4)
                     ).join('\n')+'\n');

// With `{'-n': <num>}` option
result = shell.head({'-n': 4}, 'resources/head/file2.txt', 'resources/head/file1.txt');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result, topOfFile2.slice(0, 4).concat(
                         topOfFile1.slice(0, 4)
                     ).join('\n')+'\n');

// negative values (-num) are the same as (numLines - num)
result = shell.head('-n', -46, 'resources/head/file1.txt');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result, 'file1 1\nfile1 2\nfile1 3\nfile1 4\n');

shell.exit(123);
