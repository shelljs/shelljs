var shell = require('..');

var assert = require('assert'),
    fs = require('fs');

shell.config.silent = true;

shell.rm('-rf', 'tmp');
shell.mkdir('tmp');

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
var result = shell.cat('resources/file1');
assert.equal(shell.error(), null);
assert.equal(result, 'test1');

// multiple files
var result = shell.cat('resources/file2', 'resources/file1');
assert.equal(shell.error(), null);
assert.equal(result, 'test2\ntest1');

// multiple files, array syntax
var result = shell.cat(['resources/file2', 'resources/file1']);
assert.equal(shell.error(), null);
assert.equal(result, 'test2\ntest1');

var result = shell.cat('resources/file*.txt');
assert.equal(shell.error(), null);
assert.ok(result.search('test1') > -1); // file order might be random
assert.ok(result.search('test2') > -1);

shell.exit(123);
