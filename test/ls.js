var shell = require('..');

var assert = require('assert');
var fs = require('fs');

shell.config.silent = true;

shell.rm('-rf', 'tmp');
shell.mkdir('tmp');

var result;

//
// Invalids
//

assert.equal(fs.existsSync('/asdfasdf'), false); // sanity check
result = shell.ls('/asdfasdf'); // no such file or dir
assert.ok(shell.error());
assert.equal(result.length, 0);

//
// Valids
//

result = shell.ls();
assert.equal(shell.error(), null);

result = shell.ls('/');
assert.equal(shell.error(), null);

// no args
shell.cd('resources/ls');
result = shell.ls();
assert.equal(shell.error(), null);
assert.equal(result.indexOf('file1') > -1, true);
assert.equal(result.indexOf('file2') > -1, true);
assert.equal(result.indexOf('file1.js') > -1, true);
assert.equal(result.indexOf('file2.js') > -1, true);
assert.equal(result.indexOf('filename(with)[chars$]^that.must+be-escaped') > -1, true);
assert.equal(result.indexOf('a_dir') > -1, true);
assert.equal(result.length, 6);
shell.cd('../..');

// simple arg
result = shell.ls('resources/ls');
assert.equal(shell.error(), null);
assert.equal(result.indexOf('file1') > -1, true);
assert.equal(result.indexOf('file2') > -1, true);
assert.equal(result.indexOf('file1.js') > -1, true);
assert.equal(result.indexOf('file2.js') > -1, true);
assert.equal(result.indexOf('filename(with)[chars$]^that.must+be-escaped') > -1, true);
assert.equal(result.indexOf('a_dir') > -1, true);
assert.equal(result.length, 6);

// no args, 'all' option
shell.cd('resources/ls');
result = shell.ls('-A');
assert.equal(shell.error(), null);
assert.equal(result.indexOf('file1') > -1, true);
assert.equal(result.indexOf('file2') > -1, true);
assert.equal(result.indexOf('file1.js') > -1, true);
assert.equal(result.indexOf('file2.js') > -1, true);
assert.equal(result.indexOf('filename(with)[chars$]^that.must+be-escaped') > -1, true);
assert.equal(result.indexOf('a_dir') > -1, true);
assert.equal(result.indexOf('.hidden_file') > -1, true);
assert.equal(result.indexOf('.hidden_dir') > -1, true);
assert.equal(result.length, 8);
shell.cd('../..');

// no args, 'all' option
shell.cd('resources/ls');
result = shell.ls('-a'); // (deprecated) backwards compatibility test
assert.equal(shell.error(), null);
assert.equal(result.indexOf('file1') > -1, true);
assert.equal(result.indexOf('file2') > -1, true);
assert.equal(result.indexOf('file1.js') > -1, true);
assert.equal(result.indexOf('file2.js') > -1, true);
assert.equal(result.indexOf('filename(with)[chars$]^that.must+be-escaped') > -1, true);
assert.equal(result.indexOf('a_dir') > -1, true);
assert.equal(result.indexOf('.hidden_file') > -1, true);
assert.equal(result.indexOf('.hidden_dir') > -1, true);
assert.equal(result.length, 8);
shell.cd('../..');

// wildcard, simple
result = shell.ls('resources/ls/*');
assert.equal(shell.error(), null);
assert.equal(result.indexOf('resources/ls/file1') > -1, true);
assert.equal(result.indexOf('resources/ls/file2') > -1, true);
assert.equal(result.indexOf('resources/ls/file1.js') > -1, true);
assert.equal(result.indexOf('resources/ls/file2.js') > -1, true);
assert.equal(result.indexOf('resources/ls/filename(with)[chars$]^that.must+be-escaped') > -1, true);
assert.equal(result.indexOf('resources/ls/a_dir') > -1, true);
assert.equal(result.length, 6);

// wildcard, hidden only
result = shell.ls('resources/ls/.*');
assert.equal(shell.error(), null);
assert.equal(result.indexOf('resources/ls/.hidden_file') > -1, true);
assert.equal(result.indexOf('resources/ls/.hidden_dir') > -1, true);
assert.equal(result.length, 2);

// wildcard, mid-file
result = shell.ls('resources/ls/f*le*');
assert.equal(shell.error(), null);
assert.equal(result.length, 5);
assert.equal(result.indexOf('resources/ls/file1') > -1, true);
assert.equal(result.indexOf('resources/ls/file2') > -1, true);
assert.equal(result.indexOf('resources/ls/file1.js') > -1, true);
assert.equal(result.indexOf('resources/ls/file2.js') > -1, true);
assert.equal(result.indexOf('resources/ls/filename(with)[chars$]^that.must+be-escaped') > -1, true);

// wildcard, mid-file with dot (should escape dot for regex)
result = shell.ls('resources/ls/f*le*.js');
assert.equal(shell.error(), null);
assert.equal(result.length, 2);
assert.equal(result.indexOf('resources/ls/file1.js') > -1, true);
assert.equal(result.indexOf('resources/ls/file2.js') > -1, true);

// wildcard, should not do partial matches
result = shell.ls('resources/ls/*.j'); // shouldn't get .js
assert.equal(shell.error(), null);
assert.equal(result.length, 0);

// wildcard, all files with extension
result = shell.ls('resources/ls/*.*');
assert.equal(shell.error(), null);
assert.equal(result.length, 3);
assert.equal(result.indexOf('resources/ls/file1.js') > -1, true);
assert.equal(result.indexOf('resources/ls/file2.js') > -1, true);
assert.equal(result.indexOf('resources/ls/filename(with)[chars$]^that.must+be-escaped') > -1, true);

// wildcard, with additional path
result = shell.ls('resources/ls/f*le*.js', 'resources/ls/a_dir');
assert.equal(shell.error(), null);
assert.equal(result.length, 4);
assert.equal(result.indexOf('resources/ls/file1.js') > -1, true);
assert.equal(result.indexOf('resources/ls/file2.js') > -1, true);
assert.equal(result.indexOf('b_dir') > -1, true); // no wildcard == no path prefix
assert.equal(result.indexOf('nada') > -1, true); // no wildcard == no path prefix

// wildcard for both paths
result = shell.ls('resources/ls/f*le*.js', 'resources/ls/a_dir/*');
assert.equal(shell.error(), null);
assert.equal(result.length, 4);
assert.equal(result.indexOf('resources/ls/file1.js') > -1, true);
assert.equal(result.indexOf('resources/ls/file2.js') > -1, true);
assert.equal(result.indexOf('resources/ls/a_dir/b_dir') > -1, true);
assert.equal(result.indexOf('resources/ls/a_dir/nada') > -1, true);

// wildcard for both paths, array
result = shell.ls(['resources/ls/f*le*.js', 'resources/ls/a_dir/*']);
assert.equal(shell.error(), null);
assert.equal(result.length, 4);
assert.equal(result.indexOf('resources/ls/file1.js') > -1, true);
assert.equal(result.indexOf('resources/ls/file2.js') > -1, true);
assert.equal(result.indexOf('resources/ls/a_dir/b_dir') > -1, true);
assert.equal(result.indexOf('resources/ls/a_dir/nada') > -1, true);

// recursive, no path
shell.cd('resources/ls');
result = shell.ls('-R');
assert.equal(shell.error(), null);
assert.equal(result.indexOf('a_dir') > -1, true);
assert.equal(result.indexOf('a_dir/b_dir') > -1, true);
assert.equal(result.indexOf('a_dir/b_dir/z') > -1, true);
assert.equal(result.length, 9);
shell.cd('../..');

// recusive, path given
result = shell.ls('-R', 'resources/ls');
assert.equal(shell.error(), null);
assert.equal(result.indexOf('a_dir') > -1, true);
assert.equal(result.indexOf('a_dir/b_dir') > -1, true);
assert.equal(result.indexOf('a_dir/b_dir/z') > -1, true);
assert.equal(result.length, 9);

// recusive, path given - 'all' flag
result = shell.ls('-RA', 'resources/ls');
assert.equal(shell.error(), null);
assert.equal(result.indexOf('a_dir') > -1, true);
assert.equal(result.indexOf('a_dir/b_dir') > -1, true);
assert.equal(result.indexOf('a_dir/b_dir/z') > -1, true);
assert.equal(result.indexOf('a_dir/.hidden_dir/nada') > -1, true);
assert.equal(result.length, 14);

// recursive, wildcard
result = shell.ls('-R', 'resources/ls/*');
assert.equal(shell.error(), null);
assert.equal(result.indexOf('resources/ls/a_dir') > -1, true);
assert.equal(result.indexOf('resources/ls/a_dir/b_dir') > -1, true);
assert.equal(result.indexOf('resources/ls/a_dir/b_dir/z') > -1, true);
assert.equal(result.length, 9);

// directory option, single arg
result = shell.ls('-d', 'resources/ls');
assert.equal(shell.error(), null);
assert.equal(result.length, 1);

// directory option, single arg with trailing '/'
result = shell.ls('-d', 'resources/ls/');
assert.equal(shell.error(), null);
assert.equal(result.length, 1);

// directory option, multiple args
result = shell.ls('-d', 'resources/ls/a_dir', 'resources/ls/file1');
assert.equal(shell.error(), null);
assert.ok(result.indexOf('resources/ls/a_dir') > -1);
assert.ok(result.indexOf('resources/ls/file1') > -1);
assert.equal(result.length, 2);

// directory option, globbed arg
result = shell.ls('-d', 'resources/ls/*');
assert.equal(shell.error(), null);
assert.ok(result.indexOf('resources/ls/a_dir') > -1);
assert.ok(result.indexOf('resources/ls/file1') > -1);
assert.ok(result.indexOf('resources/ls/file1.js') > -1);
assert.ok(result.indexOf('resources/ls/file2') > -1);
assert.ok(result.indexOf('resources/ls/file2.js') > -1);
assert.ok(result.indexOf('resources/ls/file2') > -1);
assert.ok(result.indexOf('resources/ls/filename(with)[chars$]^that.must+be-escaped') > -1);
assert.equal(result.length, 6);

// long option, single file
result = shell.ls('-l', 'resources/ls/file1')[0];
assert.equal(shell.error(), null);
assert.equal(result.name, 'resources/ls/file1');
assert.equal(result.nlink, 1);
assert.equal(result.size, 5);
assert.ok(result.mode); // check that these keys exist
assert.ok(process.platform === 'win32' || result.uid); // only on unix
assert.ok(process.platform === 'win32' || result.gid); // only on unix
assert.ok(result.mtime); // check that these keys exist
assert.ok(result.atime); // check that these keys exist
assert.ok(result.ctime); // check that these keys exist
assert.ok(result.toString().match(/^(\d+ +){5}.*$/));

// long option, glob files
result = shell.ls('-l', 'resources/ls/f*le1')[0];
assert.equal(shell.error(), null);
assert.equal(result.name, 'resources/ls/file1');
assert.equal(result.nlink, 1);
assert.equal(result.size, 5);
assert.ok(result.mode); // check that these keys exist
assert.ok(process.platform === 'win32' || result.uid); // only on unix
assert.ok(process.platform === 'win32' || result.gid); // only on unix
assert.ok(result.mtime); // check that these keys exist
assert.ok(result.atime); // check that these keys exist
assert.ok(result.ctime); // check that these keys exist
assert.ok(result.toString().match(/^(\d+ +){5}.*$/));

var idx;
var k;

// long option, directory
result = shell.ls('-l', 'resources/ls');
assert.equal(shell.error(), null);
for (k = 0; k < result.length; k++) {
  if (result[k].name === 'resources/ls/file1') {
    idx = k;
    break;
  }
}
assert.ok(idx);
result = result[idx];
assert.equal(result.name, 'resources/ls/file1');
assert.equal(result.nlink, 1);
assert.equal(result.size, 5);
assert.ok(result.mode); // check that these keys exist
assert.ok(process.platform === 'win32' || result.uid); // only on unix
assert.ok(process.platform === 'win32' || result.gid); // only on unix
assert.ok(result.mtime); // check that these keys exist
assert.ok(result.atime); // check that these keys exist
assert.ok(result.ctime); // check that these keys exist
assert.ok(result.toString().match(/^(\d+ +){5}.*$/));

// long option, directory, recursive
result = shell.ls('-lR', 'resources/ls/');
assert.equal(shell.error(), null);
for (k = 0; k < result.length; k++) {
  if (result[k].name === 'resources/ls/file1') {
    idx = k;
    break;
  }
}
assert.ok(idx);
result = result[idx];
assert.equal(result.name, 'resources/ls/file1');
assert.equal(result.nlink, 1);
assert.equal(result.size, 5);
assert.ok(result.mode); // check that these keys exist
assert.ok(process.platform === 'win32' || result.uid); // only on unix
assert.ok(process.platform === 'win32' || result.gid); // only on unix
assert.ok(result.mtime); // check that these keys exist
assert.ok(result.atime); // check that these keys exist
assert.ok(result.ctime); // check that these keys exist
assert.ok(result.toString().match(/^(\d+ +){5}.*$/));

shell.exit(123);
