var shell = require('..');

var assert = require('assert'),
    path = require('path'),
    fs = require('fs');

// Node shims for < v0.7
fs.existsSync = fs.existsSync || path.existsSync;

shell.config.silent = true;

function numLines(str) {
  return typeof str === 'string' ? str.match(/\n/g).length : 0;
}

shell.rm('-rf', 'tmp');
shell.mkdir('tmp');

//
// Invalids
//

'hello world'.toEnd();
assert.ok(shell.error());

assert.equal(fs.existsSync('/asdfasdf'), false); // sanity check
'hello world'.toEnd('/asdfasdf/file');
assert.ok(shell.error());

//
// Valids
//

'hello '.toEnd('tmp/toEnd1');
'world'.toEnd('tmp/toEnd1');
var result = shell.cat('tmp/toEnd1');
assert.equal(shell.error(), null);
assert.equal(result, 'hello world');

shell.exit(123);
