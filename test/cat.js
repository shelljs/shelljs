var shell = require('..');

var assert = require('assert'),
    fs = require('fs');

shell.config.silent = true;

shell.rm('-rf', 'tmp');
shell.mkdir('tmp');

//
// Invalids
//

var result = shell.cat();
assert.ok(shell.error());
assert.equal(result.code, 1);
assert.equal(result.stderr, 'cat: no paths given');

assert.equal(fs.existsSync('/asdfasdf'), false); // sanity check
result = shell.cat('/asdfasdf'); // file does not exist
assert.ok(shell.error());
assert.equal(result.code, 1);
assert.equal(result.stderr, 'cat: no such file or directory: /asdfasdf');

//
// Valids
//

// simple
result = shell.cat('resources/cat/file1');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result, 'test1\n');

// multiple files
result = shell.cat('resources/cat/file2', 'resources/cat/file1');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result, 'test2\ntest1\n');

// multiple files, array syntax
result = shell.cat(['resources/cat/file2', 'resources/cat/file1']);
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result, 'test2\ntest1\n');

result = shell.cat('resources/file*.txt');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.ok(result.search('test1') > -1); // file order might be random
assert.ok(result.search('test2') > -1);

// forEach
var file3 = 'test1\ntest2\ntest3,test4 test5\ntest6xtest7\n';
var line = file3.split('\n');
var character = file3.split('');
var word = file3.split(/\W+/);
var whitespace = file3.split(/\s+/);
var regex = file3.split(/x/);
result = shell.cat('resources/cat/file3');
result.forEach(function (a, i) { assert.equal(a, line[i]); });
result.forEach(function (a, i) { assert.equal(a, line[i]); }, { split: 'line' });
result.forEach(function (a, i) { assert.equal(a, character[i]); }, { split: 'character' });
result.forEach(function (a, i) { assert.equal(a, word[i]); }, { split: 'word' });
result.forEach(function (a, i) { assert.equal(a, whitespace[i]); }, { split: 'whitespace' });
result.forEach(function (a, i) { assert.equal(a, regex[i]); }, { split: 'regex', regex: /x/ });
result.forEach(function (a, i) { assert.equal(a, regex[i]); }, { regex: /x/ });
shell.exit(123);
