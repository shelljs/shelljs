var shell = require('..');
var assert = require('assert');
var fs = require('fs');
var crypto = require('crypto');

shell.config.silent = true;
shell.rm('-rf', 'tmp');
shell.mkdir('tmp');

var oldStat;
var testFile;

// should handle args
var result = shell.touch();
assert.ok(shell.error());
assert.equal(result.code, 1);

result = shell.touch(1);
assert.ok(shell.error());
assert.equal(result.code, 1);

// exits without error when trying to touch a directory
result = shell.touch('tmp/');
assert.ok(!shell.error());
assert.equal(result.code, 0);
result = shell.touch('tmp');
assert.ok(!shell.error());
assert.equal(result.code, 0);

// creates new files
var testFile = tmpFile();
result = shell.touch(testFile);
assert(fs.existsSync(testFile));

// does not create a file if told not to
var testFile = tmpFile(true);
result = shell.touch('-c', testFile);
assert.equal(result.code, 0);
assert.ok(!fs.existsSync(testFile));

// handles globs correctly
result = shell.touch('tmp/file.txt');
result = shell.touch('tmp/file.js');
result = shell.touch('tmp/file*');
assert.equal(result.code, 0);
var files = shell.ls('tmp/file*');
assert.ok(files.indexOf('tmp/file.txt') > -1);
assert.ok(files.indexOf('tmp/file.js') > -1);
assert.equal(files.length, 2);

// errors if reference file is not found
var testFile = tmpFile();
var refFile = tmpFile(true);
result = shell.touch({'-r': refFile}, testFile);
assert.equal(result.code, 1);
assert.ok(shell.error());

// uses a reference file for mtime
var testFile = tmpFile(false);
var testFile2 = tmpFile();
shell.touch(testFile2);
shell.exec(JSON.stringify(process.execPath)+' resources/exec/slow.js 3000');
result = shell.touch(testFile);
assert.ok(!shell.error());
assert.equal(result.code, 0);
assert.notEqual(fs.statSync(testFile).mtime.getTime(), fs.statSync(testFile2).mtime.getTime());
assert.notEqual(fs.statSync(testFile).atime.getTime(), fs.statSync(testFile2).atime.getTime());
result = shell.touch({'-r': testFile2}, testFile);
assert.ok(!shell.error());
assert.equal(result.code, 0);
assert.equal(fs.statSync(testFile).mtime.getTime(), fs.statSync(testFile2).mtime.getTime());
assert.equal(fs.statSync(testFile).atime.getTime(), fs.statSync(testFile2).atime.getTime());

// sets mtime
testFile = tmpFile();
oldStat = resetUtimes(testFile);
result = shell.touch(testFile);
assert.equal(result.code, 0);
assert(oldStat.mtime < fs.statSync(testFile).mtime);
// sets atime
assert(oldStat.atime < fs.statSync(testFile).atime);

// does not sets mtime if told not to
testFile = tmpFile();
oldStat = resetUtimes(testFile);
result = shell.touch('-a', testFile);
assert.equal(result.code, 0);
assert.equal(oldStat.mtime.getTime(), fs.statSync(testFile).mtime.getTime());

// does not sets atime if told not to
testFile = tmpFile();
oldStat = resetUtimes(testFile);
result = shell.touch('-m', testFile);
assert.equal(result.code, 0);
assert.equal(oldStat.atime.getTime(), fs.statSync(testFile).atime.getTime());

// multiple files
testFile = tmpFile(true);
testFile2 = tmpFile(true);
shell.rm('-f', testFile, testFile2);
result = shell.touch(testFile, testFile2);
assert.equal(result.code, 0);
assert(fs.existsSync(testFile));
assert(fs.existsSync(testFile2));

// file array
testFile = tmpFile(true);
testFile2 = tmpFile(true);
shell.rm('-f', testFile, testFile2);
result = shell.touch([testFile, testFile2]);
assert.equal(result.code, 0);
assert(fs.existsSync(testFile));
assert(fs.existsSync(testFile2));

// touching broken link creates a new file
if (process.platform !== 'win32') {
  result = shell.touch('resources/badlink');
  assert.equal(result.code, 0);
  assert.ok(!shell.error());
  assert.ok(fs.existsSync('resources/not_existed_file'));
  shell.rm('resources/not_existed_file');
}

function resetUtimes(f) {
  var d = new Date();
  d.setYear(2000);
  fs.utimesSync(f, d, d);
  return fs.statSync(f);
}

function tmpFile(noCreate) {
  var str = crypto.randomBytes(Math.ceil(10 / 2)).toString('hex');
  var file = 'tmp/' + str;
  if (!noCreate) {
    fs.closeSync(fs.openSync(file, 'a'));
  }
  return file;
}


// required for the test runner
shell.exit(123);

