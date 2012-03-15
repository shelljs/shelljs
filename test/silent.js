var shell = require('..');

var assert = require('assert'),
    path = require('path'),
    fs = require('fs');

// Node shims for < v0.7
fs.existsSync = fs.existsSync || path.existsSync;

function numLines(str) {
  return typeof str === 'string' ? str.match(/\n/g).length : 0;
}

//
// Valids
//

assert.equal(shell.silent(), false); // default

shell.silent(true);
assert.equal(shell.silent(), true);

shell.silent(false);
assert.equal(shell.silent(), false);

shell.exit(123);
