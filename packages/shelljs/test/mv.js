var shell = require('..');

var assert = require('assert'),
    fs = require('fs'),
    numLines = require('./utils/utils').numLines;

shell.config.silent = true;

shell.rm('-rf', 'tmp');
shell.mkdir('tmp');

// Prepare tmp/
shell.cp('resources/*', 'tmp');

//
// Invalids
//

var result = shell.mv();
assert.ok(shell.error());
assert.equal(result.code, 1);
assert.equal(result.stderr, 'mv: missing <source> and/or <dest>');

result = shell.mv('file1');
assert.ok(shell.error());
assert.equal(result.code, 1);
assert.equal(result.stderr, 'mv: missing <source> and/or <dest>');

result = shell.mv('-f');
assert.ok(shell.error());
assert.equal(result.code, 1);
assert.equal(result.stderr, 'mv: missing <source> and/or <dest>');

result = shell.mv('-Z', 'tmp/file1', 'tmp/file1'); // option not supported
assert.ok(shell.error());
assert.equal(fs.existsSync('tmp/file1'), true);
assert.equal(result.code, 1);
assert.equal(result.stderr, 'mv: option not recognized: Z');

result = shell.mv('asdfasdf', 'tmp'); // source does not exist
assert.ok(shell.error());
assert.equal(numLines(shell.error()), 1);
assert.equal(fs.existsSync('tmp/asdfasdf'), false);
assert.equal(result.code, 1);
assert.equal(result.stderr, 'mv: no such file or directory: asdfasdf');

result = shell.mv('asdfasdf1', 'asdfasdf2', 'tmp'); // sources do not exist
assert.ok(shell.error());
assert.equal(numLines(shell.error()), 2);
assert.equal(fs.existsSync('tmp/asdfasdf1'), false);
assert.equal(fs.existsSync('tmp/asdfasdf2'), false);
assert.equal(result.code, 1);
assert.equal(result.stderr, 'mv: no such file or directory: asdfasdf1\nmv: no such file or directory: asdfasdf2');

result = shell.mv('asdfasdf1', 'asdfasdf2', 'tmp/file1'); // too many sources (dest is file)
assert.ok(shell.error());
assert.equal(result.code, 1);
assert.equal(result.stderr, 'mv: dest is not a directory (too many sources)');

// -n is no-force/no-clobber
result = shell.mv('-n', 'tmp/file1', 'tmp/file2'); // dest already exists
assert.ok(shell.error());
assert.equal(result.code, 1);
assert.equal(result.stderr, 'mv: dest file already exists: tmp/file2');

// -f is the default behavior
shell.cp('tmp/file1', 'tmp/tmp_file');
result = shell.mv('tmp/tmp_file', 'tmp/file2'); // dest already exists (but that's ok)
assert.ok(!shell.error());
assert.ok(!result.stderr);
assert.equal(result.code, 0);

// -fn is the same as -n
result = shell.mv('-fn', 'tmp/file1', 'tmp/file2');
assert.ok(shell.error());
assert.equal(result.code, 1);
assert.equal(result.stderr, 'mv: dest file already exists: tmp/file2');

result = shell.mv('tmp/file1', 'tmp/file2', 'tmp/a_file'); // too many sources (exist, but dest is file)
assert.ok(shell.error());
assert.equal(fs.existsSync('tmp/a_file'), false);
assert.equal(result.code, 1);
assert.equal(result.stderr, 'mv: dest is not a directory (too many sources)');

result = shell.mv('tmp/file*', 'tmp/file1'); // can't use wildcard when dest is file
assert.ok(shell.error());
assert.equal(fs.existsSync('tmp/file1'), true);
assert.equal(fs.existsSync('tmp/file2'), true);
assert.equal(fs.existsSync('tmp/file1.js'), true);
assert.equal(fs.existsSync('tmp/file2.js'), true);
assert.equal(result.code, 1);
assert.equal(result.stderr, 'mv: dest is not a directory (too many sources)');

//
// Valids
//

shell.cd('tmp');

// handles self OK
shell.mkdir('tmp2');
result = shell.mv('*', 'tmp2'); // has to handle self (tmp2 --> tmp2) without throwing error
assert.ok(shell.error()); // there's an error, but not fatal
assert.equal(fs.existsSync('tmp2/file1'), true); // moved OK
assert.equal(result.code, 1);
result = shell.mv('tmp2/*', '.'); // revert
assert.equal(fs.existsSync('file1'), true); // moved OK
assert.equal(result.code, 0);

result = shell.mv('file1', 'file3'); // one source
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(fs.existsSync('file1'), false);
assert.equal(fs.existsSync('file3'), true);
result = shell.mv('file3', 'file1'); // revert
assert.equal(shell.error(), null);
assert.equal(fs.existsSync('file1'), true);
assert.equal(result.code, 0);

// two sources
shell.rm('-rf', 't');
shell.mkdir('-p', 't');
result = shell.mv('file1', 'file2', 't');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(fs.existsSync('file1'), false);
assert.equal(fs.existsSync('file2'), false);
assert.equal(fs.existsSync('t/file1'), true);
assert.equal(fs.existsSync('t/file2'), true);
result = shell.mv('t/*', '.'); // revert
assert.equal(result.code, 0);
assert.equal(fs.existsSync('file1'), true);
assert.equal(fs.existsSync('file2'), true);

// two sources, array style
shell.rm('-rf', 't');
shell.mkdir('-p', 't');
result = shell.mv(['file1', 'file2'], 't'); // two sources
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(fs.existsSync('file1'), false);
assert.equal(fs.existsSync('file2'), false);
assert.equal(fs.existsSync('t/file1'), true);
assert.equal(fs.existsSync('t/file2'), true);
result = shell.mv('t/*', '.'); // revert
assert.equal(fs.existsSync('file1'), true);
assert.equal(fs.existsSync('file2'), true);

result = shell.mv('file*.js', 't'); // wildcard
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(fs.existsSync('file1.js'), false);
assert.equal(fs.existsSync('file2.js'), false);
assert.equal(fs.existsSync('t/file1.js'), true);
assert.equal(fs.existsSync('t/file2.js'), true);
result = shell.mv('t/*', '.'); // revert
assert.equal(fs.existsSync('file1.js'), true);
assert.equal(fs.existsSync('file2.js'), true);

result = shell.mv('-f', 'file1', 'file2'); // dest exists, but -f given
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(fs.existsSync('file1'), false);
assert.equal(fs.existsSync('file2'), true);

shell.exit(123);
