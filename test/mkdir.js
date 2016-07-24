var shell = require('..');

var assert = require('assert'),
    fs = require('fs'),
    numLines = require('./utils/utils').numLines;

shell.config.silent = true;

shell.rm('-rf', 'tmp');
shell.mkdir('tmp');

//
// Invalids
//

var result = shell.mkdir();
assert.ok(shell.error());
assert.equal(result.code, 1);
assert.equal(result.stderr, 'mkdir: no paths given');

var mtime = fs.statSync('tmp').mtime.toString();
result = shell.mkdir('tmp'); // dir already exists
assert.ok(shell.error());
assert.equal(result.code, 1);
assert.equal(result.stderr, 'mkdir: path already exists: tmp');
assert.equal(fs.statSync('tmp').mtime.toString(), mtime); // didn't mess with dir

// Can't overwrite a broken link
mtime = fs.lstatSync('resources/badlink').mtime.toString();
result = shell.mkdir('resources/badlink');
assert.ok(shell.error());
assert.equal(result.code, 1);
assert.equal(result.stderr, 'mkdir: path already exists: resources/badlink');
assert.equal(fs.lstatSync('resources/badlink').mtime.toString(), mtime); // didn't mess with file

assert.equal(fs.existsSync('/asdfasdf'), false); // sanity check
result = shell.mkdir('/asdfasdf/foobar'); // root path does not exist
assert.ok(shell.error());
assert.equal(result.code, 1);
assert.equal(result.stderr, 'mkdir: no such file or directory: /asdfasdf');
assert.equal(fs.existsSync('/asdfasdf'), false);
assert.equal(fs.existsSync('/asdfasdf/foobar'), false);

// Check for invalid permissions
if (process.platform !== 'win32') {
  // This test case only works on unix, but should work on Windows as well
  var dirName = 'nowritedir';
  shell.mkdir(dirName);
  assert.ok(!shell.error());
  shell.chmod('-w', dirName);
  result = shell.mkdir(dirName + '/foo');
  assert.equal(result.code, 1);
  assert.equal(result.stderr, 'mkdir: cannot create directory nowritedir/foo: Permission denied');
  assert.ok(shell.error());
  assert.equal(fs.existsSync(dirName + '/foo'), false);
  shell.rm('-rf', dirName); // clean up
}

//
// Valids
//

assert.equal(fs.existsSync('tmp/t1'), false);
result = shell.mkdir('tmp/t1'); // simple dir
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(fs.existsSync('tmp/t1'), true);

assert.equal(fs.existsSync('tmp/t2'), false);
assert.equal(fs.existsSync('tmp/t3'), false);
result = shell.mkdir('tmp/t2', 'tmp/t3'); // multiple dirs
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(fs.existsSync('tmp/t2'), true);
assert.equal(fs.existsSync('tmp/t3'), true);

assert.equal(fs.existsSync('tmp/t1'), true);
assert.equal(fs.existsSync('tmp/t4'), false);
result = shell.mkdir('tmp/t1', 'tmp/t4'); // one dir exists, one doesn't
assert.equal(numLines(shell.error()), 1);
assert.equal(fs.existsSync('tmp/t1'), true);
assert.equal(fs.existsSync('tmp/t4'), true);

assert.equal(fs.existsSync('tmp/a'), false);
result = shell.mkdir('-p', 'tmp/a/b/c');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(fs.existsSync('tmp/a/b/c'), true);
shell.rm('-Rf', 'tmp/a'); // revert

// multiple dirs
result = shell.mkdir('-p', 'tmp/zzza', 'tmp/zzzb', 'tmp/zzzc');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(fs.existsSync('tmp/zzza'), true);
assert.equal(fs.existsSync('tmp/zzzb'), true);
assert.equal(fs.existsSync('tmp/zzzc'), true);

// multiple dirs, array syntax
result = shell.mkdir('-p', ['tmp/yyya', 'tmp/yyyb', 'tmp/yyyc']);
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(fs.existsSync('tmp/yyya'), true);
assert.equal(fs.existsSync('tmp/yyyb'), true);
assert.equal(fs.existsSync('tmp/yyyc'), true);

// globbed dir
result = shell.mkdir('-p', 'tmp/mydir');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(fs.existsSync('tmp/mydir'), true);
result = shell.mkdir('-p', 'tmp/m*ir');
assert.equal(shell.error(), null);
assert.equal(result.code, 0);
assert.equal(fs.existsSync('tmp/mydir'), true);
assert.equal(fs.existsSync('tmp/m*ir'), false); // doesn't create literal name

shell.exit(123);
