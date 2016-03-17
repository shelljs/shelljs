var shell = require('..');
var common = require('../src/common');
var isWindows = common.platform === 'win';

var assert = require('assert'),
    fs = require('fs'),
    path = require('path');

shell.config.silent = true;

// On Windows, symlinks for files need admin permissions. This helper
// skips certain tests if we are on Windows and got an EPERM error
function skipOnWinForEPERM (action, test) {
    action();
    var error = shell.error();

    if (isWindows && error && /EPERM:/.test(error)) {
        console.log("Got EPERM when testing symlinks on Windows. Assuming non-admin environment and skipping test.");
    } else {
        test();
    }
}

shell.rm('-rf', 'tmp');
shell.mkdir('tmp');

// Prepare tmp/
shell.cp('resources/*', 'tmp');

//
// Invalids
//

var result = shell.ln();
assert.ok(shell.error());
assert.equal(result.code, 1);

result = shell.ln('file');
assert.ok(shell.error());
assert.equal(result.code, 1);

result = shell.ln('-f');
assert.ok(shell.error());
assert.equal(result.code, 1);

result = shell.ln('tmp/file1', 'tmp/file2');
assert.ok(shell.error());
assert.equal(result.code, 1);

result = shell.ln('tmp/noexist', 'tmp/linkfile1');
assert.ok(shell.error());
assert.equal(result.code, 1);

result = shell.ln('-sf', 'no/exist', 'tmp/badlink');
assert.ok(shell.error());
assert.equal(result.code, 1);

result = shell.ln('-sf', 'noexist', 'tmp/badlink');
assert.ok(shell.error());
assert.equal(result.code, 1);

result = shell.ln('-f', 'noexist', 'tmp/badlink');
assert.ok(shell.error());
assert.equal(result.code, 1);

//
// Valids
//

result = shell.ln('tmp/file1', 'tmp/linkfile1');
assert(fs.existsSync('tmp/linkfile1'));
assert.equal(
  fs.readFileSync('tmp/file1').toString(),
  fs.readFileSync('tmp/linkfile1').toString()
);
fs.writeFileSync('tmp/file1', 'new content 1');
assert.equal(
  fs.readFileSync('tmp/linkfile1').toString(),
  'new content 1'
);
assert.equal(result.code, 0);

// With glob
shell.rm('tmp/linkfile1');
result = shell.ln('tmp/fi*1', 'tmp/linkfile1');
assert(fs.existsSync('tmp/linkfile1'));
assert.equal(
  fs.readFileSync('tmp/file1').toString(),
  fs.readFileSync('tmp/linkfile1').toString()
);
fs.writeFileSync('tmp/file1', 'new content 1');
assert.equal(
  fs.readFileSync('tmp/linkfile1').toString(),
  'new content 1'
);
assert.equal(result.code, 0);

skipOnWinForEPERM(shell.ln.bind(shell, '-s', 'file2', 'tmp/linkfile2'), function () {
    assert(fs.existsSync('tmp/linkfile2'));
    assert.equal(
        fs.readFileSync('tmp/file2').toString(),
        fs.readFileSync('tmp/linkfile2').toString()
    );
    fs.writeFileSync('tmp/file2', 'new content 2');
    assert.equal(
        fs.readFileSync('tmp/linkfile2').toString(),
        'new content 2'
    );
});

// Symbolic link directory test
shell.mkdir('tmp/ln');
shell.touch('tmp/ln/hello');
result = shell.ln('-s', 'ln', 'tmp/dir1');
assert(fs.existsSync('tmp/ln/hello'));
assert(fs.existsSync('tmp/dir1/hello'));
assert.equal(result.code, 0);

// To current directory
shell.cd('tmp');
result = shell.ln('-s', './', 'dest');
assert.equal(result.code, 0);
shell.touch('testfile.txt');
assert(fs.existsSync('testfile.txt'));
assert(fs.existsSync('dest/testfile.txt'));
shell.rm('-f', 'dest');
shell.mkdir('dir1');
shell.cd('dir1');
result = shell.ln('-s', './', '../dest');
assert.equal(result.code, 0);
shell.touch('insideDir.txt');
shell.cd('..');
assert(fs.existsSync('testfile.txt'));
assert(fs.existsSync('dest/testfile.txt'));
assert(fs.existsSync('dir1/insideDir.txt'));
assert(!fs.existsSync('dest/insideDir.txt'));
shell.cd('..');

result = shell.ln('-f', 'tmp/file1.js', 'tmp/file2.js');
assert.equal(result.code, 0);
assert(fs.existsSync('tmp/file2.js'));
assert.equal(
  fs.readFileSync('tmp/file1.js').toString(),
  fs.readFileSync('tmp/file2.js').toString()
);
fs.writeFileSync('tmp/file1.js', 'new content js');
assert.equal(
  fs.readFileSync('tmp/file2.js').toString(),
  'new content js'
);

skipOnWinForEPERM(shell.ln.bind(shell, '-sf', 'file1.txt', 'tmp/file2.txt'), function () {
    assert(fs.existsSync('tmp/file2.txt'));
    assert.equal(
        fs.readFileSync('tmp/file1.txt').toString(),
        fs.readFileSync('tmp/file2.txt').toString()
    );
    fs.writeFileSync('tmp/file1.txt', 'new content txt');
    assert.equal(
        fs.readFileSync('tmp/file2.txt').toString(),
        'new content txt'
    );
});

// Abspath regression
skipOnWinForEPERM(shell.ln.bind(shell, '-sf', 'file1', path.resolve('tmp/abspath')), function () {
    assert(fs.existsSync('tmp/abspath'));
    assert.equal(
        fs.readFileSync('tmp/file1').toString(),
        fs.readFileSync('tmp/abspath').toString()
    );
    fs.writeFileSync('tmp/file1', 'new content 3');
    assert.equal(
        fs.readFileSync('tmp/abspath').toString(),
        'new content 3'
    );
});

// Relative regression
skipOnWinForEPERM(shell.ln.bind(shell, '-sf', 'file1.txt', 'tmp/file2.txt'), function () {
    shell.mkdir('-p', 'tmp/new');
    // Move the symlink first, as the reverse confuses `mv`.
    shell.mv('tmp/file2.txt', 'tmp/new/file2.txt');
    shell.mv('tmp/file1.txt', 'tmp/new/file1.txt');
    assert(fs.existsSync('tmp/new/file2.txt'));
    assert.equal(
        fs.readFileSync('tmp/new/file1.txt').toString(),
        fs.readFileSync('tmp/new/file2.txt').toString()
    );
    fs.writeFileSync('tmp/new/file1.txt', 'new content txt');
    assert.equal(
        fs.readFileSync('tmp/new/file2.txt').toString(),
        'new content txt'
    );
});

shell.exit(123);
