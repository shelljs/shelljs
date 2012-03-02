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

// save current dir
var cur = pwd();

//
// Invalids
//

cd();
assert.ok(error());

assert.equal(fs.existsSync('/asdfasdf'), false); // sanity check
cd('/adsfasdf'); // dir does not exist
assert.ok(error());

assert.equal(fs.existsSync('resources/file1'), true); // sanity check
cd('resources/file1'); // file, not dir
assert.ok(error());

//
// Valids
//

cd(cur);
cd('tmp');
assert.equal(error(), null);
assert.equal(path.basename(process.cwd()), 'tmp');

cd(cur);
cd('/');
assert.equal(error(), null);
assert.equal(process.cwd(), path.resolve('/'));

// cd + other commands

cd(cur);
rm('-f tmp/*');
assert.equal(fs.existsSync('tmp/file1'), false);
cd('resources');
assert.equal(error(), null);
cp('file1 ../tmp');
assert.equal(error(), null);
cd('../tmp');
assert.equal(error(), null);
assert.equal(fs.existsSync('file1'), true);

exit(123);
