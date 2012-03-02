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

shell.rm('-rf', 'tmp');
shell.mkdir('tmp')

//
// Invalids
//

grep();
assert.ok(error());

grep(/asdf/g); // too few args
assert.ok(error());

assert.equal(fs.existsSync('/asdfasdf'), false); // sanity check
grep(/asdf/g, '/asdfasdf'); // no such file
assert.ok(error());

//
// Valids
//

var result = grep('line', 'resources/a.txt');
assert.equal(error(), null);
assert.equal(result.split('\n').length - 1, 4);

var result = grep('line one', 'resources/a.txt');
assert.equal(error(), null);
assert.equal(result, 'This is line one\n');

var result = grep(/line one/, 'resources/a.txt');
assert.equal(error(), null);
assert.equal(result, 'This is line one\n');

exit(123);
