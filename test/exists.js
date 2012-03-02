var shell = require('..');

var assert = require('assert'),
    path = require('path'),
    fs = require('fs');

// Node shims for < v0.7
fs.existsSync = fs.existsSync || path.existsSync;

shell.silent();

function numLines(str) {
  return typeof str === 'string' ? str.match(/\n/g).length : 0;
}

// save current dir
var cur = shell.pwd();

shell.rm('-rf', 'tmp');
shell.mkdir('tmp')

//
// Invalids
//

shell.exists();
assert.ok(shell.error());

//
// Valids
//

assert.equal(fs.existsSync('resources/file1'), true); // sanity check
var result = shell.exists('resources/file1');
assert.equal(result, true);
assert.equal(shell.error(), null);

assert.equal(fs.existsSync('/asdfasdf/asdfasdf'), false); // sanity check
var result = shell.exists('/asdfasdf/asdfasdf'); // does not exist
assert.equal(result, false);
assert.equal(shell.error(), null);

shell.exit(123);
