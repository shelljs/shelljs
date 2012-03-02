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

'hello world'.to();
assert.ok(error());

assert.equal(fs.existsSync('/asdfasdf'), false); // sanity check
'hello world'.to('/asdfasdf/file');
assert.ok(error());

//
// Valids
//

'hello world'.to('tmp/to1')
var result = cat('tmp/to1');
assert.equal(error(), null);
assert.equal(result, 'hello world');

exit(123);
