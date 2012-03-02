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

cp();
assert.ok(error());

cp('file1');
assert.ok(error());

cp('-f');
assert.ok(error());

rm('-rf tmp/*');
cp('-@ resources/file1 tmp/file1'); // option not supported, files OK
assert.ok(error());
assert.equal(fs.existsSync('tmp/file1'), false);

cp('-Z asdfasdf tmp/file2'); // option not supported, files NOT OK
assert.ok(error());
assert.equal(fs.existsSync('tmp/file2'), false);

cp('asdfasdf tmp'); // source does not exist
assert.ok(error());
assert.equal(numLines(error()), 1);
assert.equal(fs.existsSync('tmp/asdfasdf'), false);

cp('asdfasdf1 asdfasdf2 tmp'); // sources do not exist
assert.ok(error());
assert.equal(numLines(error()), 2);
assert.equal(fs.existsSync('tmp/asdfasdf1'), false);
assert.equal(fs.existsSync('tmp/asdfasdf2'), false);

cp('asdfasdf1 asdfasdf2 resources/file1'); // too many sources (dest is file)
assert.ok(error());

cp('resources/file1 resources/file2'); // dest already exists
assert.ok(error());

cp('resources/file1 resources/file2 tmp/a_file'); // too many sources
assert.ok(error());
assert.equal(fs.existsSync('tmp/a_file'), false);

//
// Valids
//

cp('resources/file1 tmp');
assert.equal(error(), null);
assert.equal(fs.existsSync('tmp/file1'), true);

cp('resources/file2 tmp/file2');
assert.equal(error(), null);
assert.equal(fs.existsSync('tmp/file2'), true);

cp('resources/file2 tmp/file3');
assert.equal(fs.existsSync('tmp/file3'), true);
cp('-f resources/file2 tmp/file3'); // file exists, but -f specified
assert.equal(error(), null);
assert.equal(fs.existsSync('tmp/file3'), true);

rm('tmp/file1 tmp/file2');
cp('resources/file* tmp');
assert.equal(error(), null);
assert.equal(fs.existsSync('tmp/file1'), true);
assert.equal(fs.existsSync('tmp/file2'), true);

//recursive, nothing exists
rm('-rf tmp/*');
cp('-R resources/cp tmp');
assert.equal(error(), null);
assert.deepEqual(ls('-R resources/cp'), ls('-R tmp/cp'));

//recursive, everything exists, no force flag
rm('-rf tmp/*')
cp('-R resources/cp tmp');
cp('-R resources/cp tmp');
assert.equal(error(), null); // crash test only

//recursive, everything exists, with force flag
rm('-rf tmp/*')
cp('-R resources/cp tmp');
'changing things around'.to('tmp/cp/dir_a/z');
assert.notEqual(cat('resources/cp/dir_a/z'), cat('tmp/cp/dir_a/z')); // before cp
cp('-Rf resources/cp tmp');
assert.equal(error(), null);
assert.equal(cat('resources/cp/dir_a/z'), cat('tmp/cp/dir_a/z')); // after cp

//recursive, everything exists, with force flag - comma-syntax
rm('-rf tmp/*')
cp('-R', 'resources/cp' ,'tmp');
'changing things around'.to('tmp/cp/dir_a/z');
assert.notEqual(cat('resources/cp/dir_a/z'), cat('tmp/cp/dir_a/z')); // before cp
cp('-Rf', 'resources/cp', 'tmp');
assert.equal(error(), null);
assert.equal(cat('resources/cp/dir_a/z'), cat('tmp/cp/dir_a/z')); // after cp

exit(123);
