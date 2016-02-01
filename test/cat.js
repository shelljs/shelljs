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

shell.cat();
assert.ok(shell.error());

assert.equal(fs.existsSync('/asdfasdf'), false); // sanity check
shell.cat('/adsfasdf'); // file does not exist
assert.ok(shell.error());

//
// Valids
//

// simple
result = shell.cat('resources/cat/file1');
assert.equal(shell.error(), null);
assert.equal(result, 'test1\n');

// multiple files
result = shell.cat('resources/cat/file2', 'resources/cat/file1');
assert.equal(shell.error(), null);
assert.equal(result, 'test2\ntest1\n');

// multiple files, array syntax
result = shell.cat(['resources/cat/file2', 'resources/cat/file1']);
assert.equal(shell.error(), null);
assert.equal(result, 'test2\ntest1\n');

result = shell.cat('resources/file*.txt');
assert.equal(shell.error(), null);
assert.ok(result.search('test1') > -1); // file order might be random
assert.ok(result.search('test2') > -1);

shell.exit(123);
