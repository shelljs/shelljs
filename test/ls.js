var shell = require('..');

var assert = require('assert'),
    path = require('path'),
    fs = require('fs');

// Node shims for < v0.7
fs.existsSync = fs.existsSync || path.existsSync;

shell.silent();

function numLines(str) {
  return typeof str === 'string' ? str.match(/\n/g).length : 0;
}

//
// Invalids
//

assert.equal(fs.existsSync('/asdfasdf'), false); // sanity check
var result = shell.ls('/asdfasdf'); // no such file or dir
assert.ok(shell.error());
assert.equal(Object.keys(result).length, 0);

//
// Valids
//

var result = shell.ls();
assert.equal(shell.error(), null);

var result = shell.ls('/');
assert.equal(shell.error(), null);

// no args
shell.cd('resources/ls');
var result = shell.ls().hash;
assert.equal(shell.error(), null);
assert.equal('file1' in result, true);
assert.equal('file2' in result, true);
assert.equal('file1.js' in result, true);
assert.equal('file2.js' in result, true);
assert.equal('filename(with)[chars$]^that.must+be-escaped' in result, true);
assert.equal('a_dir' in result, true);
assert.equal(Object.keys(result).length, 6);
shell.cd('../..');

// simple arg
var result = shell.ls('resources/ls').hash;
assert.equal(shell.error(), null);
assert.equal('file1' in result, true);
assert.equal('file2' in result, true);
assert.equal('file1.js' in result, true);
assert.equal('file2.js' in result, true);
assert.equal('filename(with)[chars$]^that.must+be-escaped' in result, true);
assert.equal('a_dir' in result, true);
assert.equal(Object.keys(result).length, 6);

// no args, 'all' option
shell.cd('resources/ls');
var result = shell.ls('-a');
assert.equal(shell.error(), null);
assert.equal('file1' in result, true);
assert.equal('file2' in result, true);
assert.equal('file1.js' in result, true);
assert.equal('file2.js' in result, true);
assert.equal('filename(with)[chars$]^that.must+be-escaped' in result, true);
assert.equal('a_dir' in result, true);
assert.equal('.hidden_file' in result, true);
assert.equal('.hidden_dir' in result, true);
assert.equal(Object.keys(result).length, 8);
shell.cd('../..');

// wildcard, simple
var result = shell.ls('resources/ls/*');
assert.equal(shell.error(), null);
assert.equal('resources/ls/file1' in result, true);
assert.equal('resources/ls/file2' in result, true);
assert.equal('resources/ls/file1.js' in result, true);
assert.equal('resources/ls/file2.js' in result, true);
assert.equal('resources/ls/filename(with)[chars$]^that.must+be-escaped' in result, true);
assert.equal('resources/ls/a_dir' in result, true);
assert.equal(Object.keys(result).length, 6);

// wildcard, hidden only
var result = shell.ls('resources/ls/.*');
assert.equal(shell.error(), null);
assert.equal('resources/ls/.hidden_file' in result, true);
assert.equal('resources/ls/.hidden_dir' in result, true);
assert.equal(Object.keys(result).length, 2);

// wildcard, mid-file
var result = shell.ls('resources/ls/f*le*');
assert.equal(shell.error(), null);
assert.equal(Object.keys(result).length, 5);
assert.equal('resources/ls/file1' in result, true);
assert.equal('resources/ls/file2' in result, true);
assert.equal('resources/ls/file1.js' in result, true);
assert.equal('resources/ls/file2.js' in result, true);
assert.equal('resources/ls/filename(with)[chars$]^that.must+be-escaped' in result, true);

// wildcard, mid-file with dot (should escape dot for regex)
var result = shell.ls('resources/ls/f*le*.js');
assert.equal(shell.error(), null);
assert.equal(Object.keys(result).length, 2);
assert.equal('resources/ls/file1.js' in result, true);
assert.equal('resources/ls/file2.js' in result, true);

// wildcard, with additional path
var result = shell.ls('resources/ls/f*le*.js', 'resources/ls/a_dir');
assert.equal(shell.error(), null);
assert.equal(Object.keys(result).length, 4);
assert.equal('resources/ls/file1.js' in result, true);
assert.equal('resources/ls/file2.js' in result, true);
assert.equal('b_dir' in result, true); // no wildcard == no path prefix
assert.equal('nada' in result, true); // no wildcard == no path prefix

// wildcard for both paths
var result = shell.ls('resources/ls/f*le*.js', 'resources/ls/a_dir/*');
assert.equal(shell.error(), null);
assert.equal(Object.keys(result).length, 4);
assert.equal('resources/ls/file1.js' in result, true);
assert.equal('resources/ls/file2.js' in result, true);
assert.equal('resources/ls/a_dir/b_dir' in result, true);
assert.equal('resources/ls/a_dir/nada' in result, true);

// recursive, no path
shell.cd('resources/ls');
var result = shell.ls('-R');
assert.equal(shell.error(), null);
assert.equal('a_dir' in result, true);
assert.equal('a_dir/b_dir' in result, true);
assert.equal('a_dir/b_dir/z' in result, true);
assert.equal(Object.keys(result).length, 10);
shell.cd('../..');

// recusive, path given
var result = shell.ls('-R', 'resources/ls');
assert.equal(shell.error(), null);
assert.equal('a_dir' in result, true);
assert.equal('a_dir/b_dir' in result, true);
assert.equal('a_dir/b_dir/z' in result, true);
assert.equal(Object.keys(result).length, 10);

// recursive, wildcard
var result = shell.ls('-R', 'resources/ls/*');
assert.equal(shell.error(), null);
assert.equal('resources/ls/a_dir' in result, true);
assert.equal('resources/ls/a_dir/b_dir' in result, true);
assert.equal('resources/ls/a_dir/b_dir/z' in result, true);
assert.equal(Object.keys(result).length, 10);

shell.exit(123);
