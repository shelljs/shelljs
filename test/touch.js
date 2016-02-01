var shell = require('../shell.js');
var assert = require('assert');
var fs = require('fs');
var crypto = require('crypto');

shell.config.silent = true;
shell.rm('-rf', 'tmp');
shell.mkdir('tmp');

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

var testFile;
// creates new files
testFile = tmpFile();
shell.touch(testFile);
assert(fs.existsSync(testFile));

// does not create a file if told not to
testFile = tmpFile(true);
shell.touch('-c', testFile);
assert.ok(!fs.existsSync(testFile));

// errors if reference file is not found
testFile = tmpFile();
var refFile = tmpFile(true);
shell.touch({ '-r': refFile }, testFile);
assert.ok(shell.error());

// uses a reference file for mtime
testFile = tmpFile(false);
var testFile2 = tmpFile();
var testFile2Stat = resetUtimes(testFile2);

shell.touch({ '-r': testFile2 }, testFile);
var testFileStat = resetUtimes(testFile);
assert.strictEqual(testFileStat.mtime.getTime(), testFile2Stat.mtime.getTime());

// sets mtime
var oldStat;

testFile = tmpFile();
oldStat = resetUtimes(testFile);
shell.touch(testFile);
assert(oldStat.mtime < fs.statSync(testFile).mtime);
// sets atime
assert(oldStat.atime < fs.statSync(testFile).atime);

// does not sets mtime if told not to
testFile = tmpFile();
oldStat = resetUtimes(testFile);
shell.touch('-a', testFile);
assert.equal(oldStat.mtime.getTime(), fs.statSync(testFile).mtime.getTime());

// does not sets atime if told not to
testFile = tmpFile();
oldStat = resetUtimes(testFile);
shell.touch('-m', testFile);
assert.equal(oldStat.atime.getTime(), fs.statSync(testFile).atime.getTime());


// required for the test runner
shell.exit(123);
