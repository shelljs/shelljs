var shell = require('..');

var assert = require('assert'),
    path = require('path'),
    fs = require('fs'),
    os = require('os');

// Node shims for < v0.7
fs.existsSync = fs.existsSync || path.existsSync;

shell.config.silent = true;

function numLines(str) {
  return typeof str === 'string' ? str.match(/\n/g).length : 0;
}

shell.rm('-rf', 'tmp');
shell.mkdir('tmp');

//
// Valids
//

var tmp = shell.tempdir();
// node 0.8+
if (os.tmpDir) {
  assert.equal(os.tmpDir(), tmp);
}
assert.equal(shell.error(), null);
assert.equal(fs.existsSync(tmp), true);

shell.exit(123);
