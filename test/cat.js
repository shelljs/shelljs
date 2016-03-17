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

shell.exit(123);
