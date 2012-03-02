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

// Prepare tmp/
rm('-rf tmp/*');
assert.equal(error(), null);
cp('resources/* tmp');
assert.equal(error(), null);

//
// Invalids
//

mv();
assert.ok(error());

mv('file1');
assert.ok(error());

mv('-f');
assert.ok(error());

mv('-Z tmp/file1 tmp/file1'); // option not supported
assert.ok(error());
assert.equal(fs.existsSync('tmp/file1'), true);

mv('asdfasdf tmp'); // source does not exist
assert.ok(error());
assert.equal(numLines(error()), 1);
assert.equal(fs.existsSync('tmp/asdfasdf'), false);

mv('asdfasdf1 asdfasdf2 tmp'); // sources do not exist
assert.ok(error());
assert.equal(numLines(error()), 2);
assert.equal(fs.existsSync('tmp/asdfasdf1'), false);
assert.equal(fs.existsSync('tmp/asdfasdf2'), false);

mv('asdfasdf1 asdfasdf2 tmp/file1'); // too many sources (dest is file)
assert.ok(error());

mv('tmp/file1 tmp/file2'); // dest already exists
assert.ok(error());

mv('tmp/file1 tmp/file2 tmp/a_file'); // too many sources (exist, but dest is file)
assert.ok(error());
assert.equal(fs.existsSync('tmp/a_file'), false);

mv('tmp/file* tmp/file1'); // can't use wildcard when dest is file
assert.ok(error());
assert.equal(fs.existsSync('tmp/file1'), true);
assert.equal(fs.existsSync('tmp/file2'), true);
assert.equal(fs.existsSync('tmp/file1.js'), true);
assert.equal(fs.existsSync('tmp/file2.js'), true);

//
// Valids
//

cd('tmp');

// handles self OK
mkdir('tmp2');
mv('* tmp2'); // has to handle self (tmp2 --> tmp2) without throwing error
assert.ok(error()); // there's an error, but not fatal
assert.equal(fs.existsSync('tmp2/file1'), true); // moved OK
mv('tmp2/* .'); // revert
assert.equal(fs.existsSync('file1'), true); // moved OK

mv('file1 file3'); // one source
assert.equal(error(), null);
assert.equal(fs.existsSync('file1'), false);
assert.equal(fs.existsSync('file3'), true);
mv('file3 file1'); // revert
assert.equal(error(), null);
assert.equal(fs.existsSync('file1'), true);

mkdir('-p t');
mv('file1 file2 t'); // two sources
assert.equal(error(), null);
assert.equal(fs.existsSync('file1'), false);
assert.equal(fs.existsSync('file2'), false);
assert.equal(fs.existsSync('t/file1'), true);
assert.equal(fs.existsSync('t/file2'), true);
mv('t/* .'); // revert
assert.equal(fs.existsSync('file1'), true);
assert.equal(fs.existsSync('file2'), true);

mv('file*.js t'); // wildcard
assert.equal(error(), null);
assert.equal(fs.existsSync('file1.js'), false);
assert.equal(fs.existsSync('file2.js'), false);
assert.equal(fs.existsSync('t/file1.js'), true);
assert.equal(fs.existsSync('t/file2.js'), true);
mv('t/* .'); // revert
assert.equal(fs.existsSync('file1.js'), true);
assert.equal(fs.existsSync('file2.js'), true);

mv('-f file1 file2'); // dest exists, but -f given
assert.equal(error(), null);
assert.equal(fs.existsSync('file1'), false);
assert.equal(fs.existsSync('file2'), true);
mv('-f file2 file1'); // revert

// comma-syntax
mv('-f', 'file1', 'file2'); // dest exists, but -f given
assert.equal(error(), null);
assert.equal(fs.existsSync('file1'), false);
assert.equal(fs.existsSync('file2'), true);

exit(123);
