var shell = require('..');

var assert = require('assert'),
    path = require('path'),
    fs = require('fs');

// Node shims for < v0.7
fs.existsSync = fs.existsSync || path.existsSync;

shell.silent();

shell.rm('-rf', 'tmp');
shell.mkdir('tmp')

//
// Invalids
//

shell.rm();
assert.ok(shell.error());

shell.rm('asdfasdf'); // file does not exist
assert.ok(shell.error());

shell.rm('-f'); // no file
assert.ok(shell.error());

shell.rm('-@', 'resources/file1'); // invalid option
assert.ok(shell.error());
assert.equal(fs.existsSync('resources/file1'), true);

//
// Valids
//

shell.rm('-f', 'asdfasdf'); // file does not exist, but -f specified
assert.equal(shell.error(), null);

shell.cp('-f', 'resources/file1', 'tmp/file1');
assert.equal(fs.existsSync('tmp/file1'), true);
shell.rm('tmp/file1'); // simple rm
assert.equal(shell.error(), null);
assert.equal(fs.existsSync('tmp/file1'), false);

shell.mkdir('-p', 'tmp/a/b/c');
assert.equal(fs.existsSync('tmp/a/b/c'), true);
shell.rm('-rf', 'tmp/a'); // recursive dir removal
assert.equal(shell.error(), null);
assert.equal(fs.existsSync('tmp/a'), false);

shell.cp('-f', 'resources/file*', 'tmp');
assert.equal(shell.error(), null);
assert.equal(fs.existsSync('tmp/file1'), true);
assert.equal(fs.existsSync('tmp/file2'), true);
assert.equal(fs.existsSync('tmp/file1.js'), true);
assert.equal(fs.existsSync('tmp/file2.js'), true);
shell.rm('tmp/file*');
assert.equal(shell.error(), null);
assert.equal(fs.existsSync('tmp/file1'), false);
assert.equal(fs.existsSync('tmp/file2'), false);
assert.equal(fs.existsSync('tmp/file1.js'), false);
assert.equal(fs.existsSync('tmp/file2.js'), false);

// recursive dir removal
shell.mkdir('-p', 'tmp/a/b/c');
shell.mkdir('-p', 'tmp/b');
shell.mkdir('-p', 'tmp/c');
shell.mkdir('-p', 'tmp/.hidden');
assert.equal(fs.existsSync('tmp/a/b/c'), true);
assert.equal(fs.existsSync('tmp/b'), true);
assert.equal(fs.existsSync('tmp/c'), true);
assert.equal(fs.existsSync('tmp/.hidden'), true);
shell.rm('-rf', 'tmp/*'); 
assert.equal(shell.error(), null);
var contents = fs.readdirSync('tmp');
assert.equal(contents.length, 1);
assert.equal(contents[0], '.hidden'); // shouldn't remove hiddden if no .* given

// recursive dir removal
shell.mkdir('-p', 'tmp/a/b/c');
shell.mkdir('-p', 'tmp/b');
shell.mkdir('-p', 'tmp/c');
shell.mkdir('-p', 'tmp/.hidden');
assert.equal(fs.existsSync('tmp/a/b/c'), true);
assert.equal(fs.existsSync('tmp/b'), true);
assert.equal(fs.existsSync('tmp/c'), true);
assert.equal(fs.existsSync('tmp/.hidden'), true);
shell.rm('-rf', 'tmp/*', 'tmp/.*');
assert.equal(shell.error(), null);
var contents = fs.readdirSync('tmp');
assert.equal(contents.length, 0);

// recursive dir removal - array-syntax
shell.mkdir('-p', 'tmp/a/b/c');
shell.mkdir('-p', 'tmp/b');
shell.mkdir('-p', 'tmp/c');
shell.mkdir('-p', 'tmp/.hidden');
assert.equal(fs.existsSync('tmp/a/b/c'), true);
assert.equal(fs.existsSync('tmp/b'), true);
assert.equal(fs.existsSync('tmp/c'), true);
assert.equal(fs.existsSync('tmp/.hidden'), true);
shell.rm('-rf', ['tmp/*', 'tmp/.*']);
assert.equal(shell.error(), null);
var contents = fs.readdirSync('tmp');
assert.equal(contents.length, 0);

shell.exit(123);
