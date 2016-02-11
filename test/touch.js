var shell = require('..');
var assert = require('assert');
var fs = require('fs');
var crypto = require('crypto');

shell.config.silent = true;
shell.rm('-rf', 'tmp');
shell.mkdir('tmp');

// should handle args
shell.touch();
assert.ok(shell.error());

shell.touch(1);
assert.ok(shell.error());

// exits without error when trying to touch a directory
shell.touch('tmp/');
assert.ok(!shell.error());
shell.touch('tmp');
assert.ok(!shell.error());

// creates new files
var testFile = tmpFile();
shell.touch(testFile);
assert(fs.existsSync(testFile));

// does not create a file if told not to
var testFile = tmpFile(true);
shell.touch('-c', testFile);
assert.ok(!fs.existsSync(testFile));

// handles globs correctly
shell.touch('tmp/file.txt');
shell.touch('tmp/file.js');
shell.touch('tmp/file*');
var files = shell.ls('tmp/file*');
assert.ok(files.indexOf('tmp/file.txt') > -1);
assert.ok(files.indexOf('tmp/file.js') > -1);
assert.equal(files.length, 2);

// errors if reference file is not found
var testFile = tmpFile();
var refFile = tmpFile(true);
shell.touch({'-r': refFile}, testFile);
assert.ok(shell.error());

// uses a reference file for mtime
var testFile = tmpFile(false);
var testFile2 = tmpFile();
shell.touch(testFile2);
shell.exec('node resources/exec/slow.js 3000');
shell.touch(testFile);
assert.ok(!shell.error());
assert.notEqual(fs.statSync(testFile).mtime.getTime(), fs.statSync(testFile2).mtime.getTime());
assert.notEqual(fs.statSync(testFile).atime.getTime(), fs.statSync(testFile2).atime.getTime());
shell.touch({'-r': testFile2}, testFile);
assert.ok(!shell.error());
assert.equal(fs.statSync(testFile).mtime.getTime(), fs.statSync(testFile2).mtime.getTime());
assert.equal(fs.statSync(testFile).atime.getTime(), fs.statSync(testFile2).atime.getTime());

// sets mtime
var testFile = tmpFile();
var oldStat = resetUtimes(testFile);
shell.touch(testFile);
assert(oldStat.mtime < fs.statSync(testFile).mtime);
// sets atime
assert(oldStat.atime < fs.statSync(testFile).atime);

// does not sets mtime if told not to
var testFile = tmpFile();
var oldStat = resetUtimes(testFile);
shell.touch('-a', testFile);
assert.equal(oldStat.mtime.getTime(), fs.statSync(testFile).mtime.getTime());

// does not sets atime if told not to
var testFile = tmpFile();
var oldStat = resetUtimes(testFile);
shell.touch('-m', testFile);
assert.equal(oldStat.atime.getTime(), fs.statSync(testFile).atime.getTime());

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

