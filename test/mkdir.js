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

mkdir();
assert.ok(error());

var mtime = fs.statSync('tmp').mtime.toString();
mkdir('tmp'); // dir already exists
assert.ok(error());
assert.equal(fs.statSync('tmp').mtime.toString(), mtime); // didn't mess with dir

assert.equal(fs.existsSync('/asdfasdf'), false); // sanity check
mkdir('/asdfasdf/asdfasdf'); // root path does not exist
assert.ok(error());
assert.equal(fs.existsSync('/asdfasdf'), false);

//
// Valids
//

assert.equal(fs.existsSync('tmp/t1'), false);
mkdir('tmp/t1'); // simple dir
assert.equal(error(), null);
assert.equal(fs.existsSync('tmp/t1'), true);

assert.equal(fs.existsSync('tmp/t2'), false);
assert.equal(fs.existsSync('tmp/t3'), false);
mkdir('tmp/t2 tmp/t3'); // multiple dirs
assert.equal(error(), null);
assert.equal(fs.existsSync('tmp/t2'), true);
assert.equal(fs.existsSync('tmp/t3'), true);

assert.equal(fs.existsSync('tmp/t1'), true);
assert.equal(fs.existsSync('tmp/t4'), false);
mkdir('tmp/t1 tmp/t4'); // one dir exists, one doesn't
assert.equal(numLines(error()), 1);
assert.equal(fs.existsSync('tmp/t1'), true);
assert.equal(fs.existsSync('tmp/t4'), true);

assert.equal(fs.existsSync('tmp/a'), false);
mkdir('-p tmp/a/b/c');
assert.equal(error(), null);
assert.equal(fs.existsSync('tmp/a/b/c'), true);
rm('-Rf tmp/a'); // revert

// comma-syntax
assert.equal(fs.existsSync('tmp/a'), false);
mkdir('-p', 'tmp/a/b/c tmp/d/e/f');
assert.equal(error(), null);
assert.equal(fs.existsSync('tmp/a/b/c'), true);
assert.equal(fs.existsSync('tmp/d/e/f'), true);

exit(123);
