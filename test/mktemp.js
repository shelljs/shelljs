var shell = require('..'),
    common = require('../src/common');

var assert = require('assert'),
    fs = require('fs'),
    path = require('path');

shell.config.silent = true;
shell.rm('-rf', 'tmp');
shell.mkdir('tmp');

// Not testing chmod on Windows.
var isNotWindows = common.platform !== 'win';
var result;


//
// Invalids
//

shell.touch(path.resolve('.', 'tmp/tmp.A'));
result = shell.mktemp(path.resolve('.', 'tmp/tmp.A')); // Guarenteed to have a confilct, no randomness.
assert.ok(shell.error());
assert.equal(result.code, 2);

//
// Valids
//

// Basics
result = shell.mktemp();
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result.length, 1);
assert.ok(fs.existsSync(result[0]));
assert.ok(fs.statSync(result[0]).isFile());
if (isNotWindows) assert.equal(fs.statSync(result[0]).mode & parseInt('777', 8), parseInt('0600', 8));

// Directory
result = shell.mktemp('-d');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result.length, 1);
assert.ok(fs.existsSync(result[0]));
assert.ok(fs.statSync(result[0]).isDirectory());
if (isNotWindows) assert.equal(fs.statSync(result[0]).mode & parseInt('777', 8), parseInt('0600', 8));

// Reasonable Default Template
result = shell.mktemp();
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result.length, 1);
assert.equal(path.dirname(result[0]), shell.tempdir());
assert.ok(fs.existsSync(result[0]));
assert.ok(fs.statSync(result[0]).isFile());

// Reasonable Default Template (Directory)
result = shell.mktemp('-d');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result.length, 1);
assert.equal(path.dirname(result[0]), shell.tempdir());
assert.ok(fs.existsSync(result[0]));
assert.ok(fs.statSync(result[0]).isDirectory());

// Custom Template
result = shell.mktemp('tmp/tmp.XXX');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result.length, 1);
assert.equal(result[0].slice(0, -3), path.resolve('.', 'tmp/tmp.'));
assert.ok(fs.existsSync(result[0]));
assert.ok(fs.statSync(result[0]).isFile());
if (isNotWindows) assert.equal(fs.statSync(result[0]).mode & parseInt('777', 8), parseInt('0600', 8));

// Custom Template (Directory)
result = shell.mktemp('-d', path.resolve('.', 'tmp/tmp.XXX'));
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result.length, 1);
assert.equal(result[0].slice(0, -3), path.resolve('.', 'tmp/tmp.'));
assert.ok(fs.existsSync(result[0]));
assert.ok(fs.statSync(result[0]).isDirectory());
if (isNotWindows) assert.equal(fs.statSync(result[0]).mode & parseInt('777', 8), parseInt('0600', 8));

// Custom Templates
result = shell.mktemp(path.resolve('.', 'tmp/tmp.AXXX'), path.resolve('.', 'tmp/tmp.BXXX'));
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result.length, 2);
assert.equal(result[0].slice(0, -3), path.resolve('.', 'tmp/tmp.A'));
assert.equal(result[1].slice(0, -3), path.resolve('.', 'tmp/tmp.B'));
assert.ok(fs.existsSync(result[0]));
assert.ok(fs.statSync(result[0]).isFile());
assert.ok(fs.existsSync(result[1]));
assert.ok(fs.statSync(result[1]).isFile());
if (isNotWindows) assert.equal(fs.statSync(result[0]).mode & parseInt('777', 8), parseInt('0600', 8));
if (isNotWindows) assert.equal(fs.statSync(result[1]).mode & parseInt('777', 8), parseInt('0600', 8));

// Custom Templates (Directory)
result = shell.mktemp('-d', path.resolve('.', 'tmp/tmp.AXXX'), path.resolve('.', 'tmp/tmp.BXXX'));
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result.length, 2);
assert.equal(result[0].slice(0, -3), path.resolve('.', 'tmp/tmp.A'));
assert.equal(result[1].slice(0, -3), path.resolve('.', 'tmp/tmp.B'));
assert.ok(fs.existsSync(result[0]));
assert.ok(fs.statSync(result[0]).isDirectory());
assert.ok(fs.existsSync(result[1]));
assert.ok(fs.statSync(result[1]).isDirectory());
if (isNotWindows) assert.equal(fs.statSync(result[0]).mode & parseInt('777', 8), parseInt('0600', 8));

// Unsafe Mode
result = shell.mktemp('-u');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result.length, 1);
assert.ok(!fs.existsSync(result[0]));

// Unsafe Mode (Custom Templates)
result = shell.mktemp('-u', path.resolve('.', 'tmp/tmp.AXXX'), path.resolve('.', 'tmp/tmp.BXXX'));
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(result.length, 2);
assert.equal(result[0].slice(0, -3), path.resolve('.', 'tmp/tmp.A'));
assert.equal(result[1].slice(0, -3), path.resolve('.', 'tmp/tmp.B'));
assert.ok(!fs.existsSync(result[0]));
assert.ok(!fs.existsSync(result[1]));

shell.exit(123);
