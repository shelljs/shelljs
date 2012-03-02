require('../maker');

var assert = require('assert'),
    path = require('path'),
    fs = require('fs');

// Node shims for < v0.7
fs.existsSync = fs.existsSync || path.existsSync;

silent();

function numLines(str) {
  return typeof str === 'string' ? str.match(/\n/g).length : 0;
}

// save current dir
var cur = pwd();

//
// Invalids
//

cat();
assert.ok(error());

assert.equal(fs.existsSync('/asdfasdf'), false); // sanity check
cat('/adsfasdf'); // file does not exist
assert.ok(error());

//
// Valids
//

assert.equal(cat, read); // should be synonyms

// simple
var result = cat('resources/file1');
assert.equal(error(), null);
assert.equal(result, 'test1');

// multiple files
var result = cat('resources/file2 resources/file1');
assert.equal(error(), null);
assert.equal(result, 'test2\ntest1');

// multiple files, comma-syntax
var result = cat('resources/file2', 'resources/file1');
assert.equal(error(), null);
assert.equal(result, 'test2\ntest1');

var result = cat('resources/file*.txt');
assert.equal(error(), null);
assert.ok(result.search('test1') > -1); // file order might be random
assert.ok(result.search('test2') > -1);

exit(123);
