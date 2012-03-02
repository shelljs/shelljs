require('../maker');

var assert = require('assert'),
    path = require('path'),
    fs = require('fs');

// Node shims for < v0.7
fs.existsSync = fs.existsSync || path.existsSync;

silent();

shell.rm('-rf', 'tmp');
shell.mkdir('tmp')

//
// Invalids
//

rm();
assert.ok(error());

rm('asdfasdf'); // file does not exist
assert.ok(error());

rm('-f'); // no file
assert.ok(error());

rm('-@ resources/file1'); // invalid option
assert.ok(error());
assert.equal(fs.existsSync('resources/file1'), true);

//
// Valids
//

rm('-f asdfasdf'); // file does not exist, but -f specified
assert.equal(error(), null);

cp('-f resources/file1 tmp/file1');
assert.equal(fs.existsSync('tmp/file1'), true);
rm('tmp/file1'); // simple rm
assert.equal(error(), null);
assert.equal(fs.existsSync('tmp/file1'), false);

mkdir('-p tmp/a/b/c');
assert.equal(fs.existsSync('tmp/a/b/c'), true);
rm('-rf tmp/a'); // recursive dir removal
assert.equal(error(), null);
assert.equal(fs.existsSync('tmp/a'), false);

cp('-f resources/file* tmp');
assert.equal(error(), null);
assert.equal(fs.existsSync('tmp/file1'), true);
assert.equal(fs.existsSync('tmp/file2'), true);
assert.equal(fs.existsSync('tmp/file1.js'), true);
assert.equal(fs.existsSync('tmp/file2.js'), true);
rm('tmp/file*');
assert.equal(error(), null);
assert.equal(fs.existsSync('tmp/file1'), false);
assert.equal(fs.existsSync('tmp/file2'), false);
assert.equal(fs.existsSync('tmp/file1.js'), false);
assert.equal(fs.existsSync('tmp/file2.js'), false);

// recursive dir removal
mkdir('-p tmp/a/b/c');
mkdir('-p tmp/b');
mkdir('-p tmp/c');
mkdir('-p tmp/.hidden');
assert.equal(fs.existsSync('tmp/a/b/c'), true);
assert.equal(fs.existsSync('tmp/b'), true);
assert.equal(fs.existsSync('tmp/c'), true);
assert.equal(fs.existsSync('tmp/.hidden'), true);
rm('-rf tmp/*'); 
assert.equal(error(), null);
var contents = fs.readdirSync('tmp');
assert.equal(contents.length, 1);
assert.equal(contents[0], '.hidden'); // shouldn't remove hiddden if no .* given

// recursive dir removal
mkdir('-p tmp/a/b/c');
mkdir('-p tmp/b');
mkdir('-p tmp/c');
mkdir('-p tmp/.hidden');
assert.equal(fs.existsSync('tmp/a/b/c'), true);
assert.equal(fs.existsSync('tmp/b'), true);
assert.equal(fs.existsSync('tmp/c'), true);
assert.equal(fs.existsSync('tmp/.hidden'), true);
rm('-rf tmp/* tmp/.*');
assert.equal(error(), null);
var contents = fs.readdirSync('tmp');
assert.equal(contents.length, 0);

// recursive dir removal - comma-syntax
mkdir('-p tmp/a/b/c');
mkdir('-p tmp/b');
mkdir('-p tmp/c');
mkdir('-p tmp/.hidden');
assert.equal(fs.existsSync('tmp/a/b/c'), true);
assert.equal(fs.existsSync('tmp/b'), true);
assert.equal(fs.existsSync('tmp/c'), true);
assert.equal(fs.existsSync('tmp/.hidden'), true);
rm('-rf', 'tmp/*', 'tmp/.*');
assert.equal(error(), null);
var contents = fs.readdirSync('tmp');
assert.equal(contents.length, 0);

exit(123);
