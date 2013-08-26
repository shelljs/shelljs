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
assert.ok(shell.error());
//
// Valids
//

assert.equal(fs.existsSync('tmp/toEnd1'), false); //Check file toEnd() creates does not already exist
'hello '.toEnd('tmp/toEnd1');
assert.equal(fs.existsSync('tmp/toEnd1'), true); //Check that file was created
'world'.toEnd('tmp/toEnd1'); //Write some more to the file
var result = shell.cat('tmp/toEnd1');
assert.equal(shell.error(), null);
assert.equal(result, 'hello world'); //Check that the result is what we expect

shell.exit(123);
