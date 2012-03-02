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

//
// Invalids
//

sed();
assert.ok(error());

sed(/asdf/g); // too few args
assert.ok(error());

sed(/asdf/g, 'nada'); // too few args
assert.ok(error());

assert.equal(fs.existsSync('/asdfasdf'), false); // sanity check
sed(/asdf/g, 'nada', '/asdfasdf'); // no such file
assert.ok(error());

//
// Valids
//

cp('-f resources/file1 tmp/file1')
var result = sed('test1', 'hello', 'tmp/file1'); // search string
assert.equal(error(), null);
assert.equal(result, 'hello');

var result = sed(/test1/, 'hello', 'tmp/file1'); // search regex
assert.equal(error(), null);
assert.equal(result, 'hello');

var result = sed(/test1/, 1234, 'tmp/file1'); // numeric replacement
assert.equal(error(), null);
assert.equal(result, '1234');

var result = sed(/test1/, 'hello', 'tmp/file1', {inplace:true});
assert.equal(error(), null);
assert.equal(result, 'hello');
assert.equal(cat('tmp/file1'), 'hello');

exit(123);
