var shell = require('..');

var assert = require('assert'),
    fs = require('fs'),
    path = require('path');

shell.config.silent = true;

shell.rm('-rf', 'tmp');
shell.mkdir('tmp');

// Prepare tmp/
shell.cp('resources/*', 'tmp');

//
// Invalids
//

shell.ln();
assert.ok(shell.error());

shell.ln('file');
assert.ok(shell.error());

shell.ln('-f');
assert.ok(shell.error());

shell.ln('tmp/file1', 'tmp/file2');
assert.ok(shell.error());

shell.ln('tmp/noexist', 'tmp/linkfile1');
assert.ok(shell.error());

shell.ln('-sf', 'no/exist', 'tmp/badlink');
assert.ok(shell.error());

shell.ln('-sf', 'noexist', 'tmp/badlink');
assert.ok(shell.error());

shell.ln('-f', 'noexist', 'tmp/badlink');
assert.ok(shell.error());

//
// Valids
//

shell.ln('tmp/file1', 'tmp/linkfile1');
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

shell.ln('-s', 'file2', 'tmp/linkfile2');
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

shell.ln('-f', 'tmp/file1.js', 'tmp/file2.js');
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

shell.ln('-sf', 'file1.txt', 'tmp/file2.txt');
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

// Abspath regression
shell.ln('-sf', 'file1', path.resolve('tmp/abspath'));
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

// Relative regression
shell.ln('-sf', 'file1.txt', 'tmp/file2.txt');
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

shell.exit(123);
