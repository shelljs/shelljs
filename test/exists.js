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

shell.rm('-rf', 'tmp');
shell.mkdir('tmp')

//
// Invalids
//

exists();
assert.ok(error());

//
// Valids
//

assert.equal(fs.existsSync('resources/file1'), true); // sanity check
var result = exists('resources/file1');
assert.equal(result, true);
assert.equal(error(), null);

assert.equal(fs.existsSync('/asdfasdf/asdfasdf'), false); // sanity check
var result = exists('/asdfasdf/asdfasdf'); // does not exist
assert.equal(result, false);
assert.equal(error(), null);

exit(123);
