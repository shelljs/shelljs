import test from 'ava';
import shell from '..';
import fs from 'fs';
import crypto from 'crypto';
import utils from './utils/utils';

let TMP;

function resetUtimes(f) {
  const d = new Date();
  d.setYear(2000);
  fs.utimesSync(f, d, d);
  return fs.statSync(f);
}

function tmpFile(noCreate) {
  const str = crypto.randomBytes(Math.ceil(10 / 2)).toString('hex');
  const file = `${TMP}/${str}`;
  if (!noCreate) {
    fs.closeSync(fs.openSync(file, 'a'));
  }
  return file;
}

test.beforeEach(() => {
  TMP = utils.getTempDir();
  shell.config.silent = true;
  shell.mkdir(TMP);
});

test.afterEach(() => {
  shell.rm('-rf', TMP);
});


//
// Valids
//

test('should handle args', t => {
  const result = shell.touch();
  t.truthy(shell.error());
  t.is(result.code, 1);
});

test('arguments must be strings', t => {
  const result = shell.touch(1);
  t.truthy(shell.error());
  t.is(result.code, 1);
});

test('exits without error when trying to touch a directory', t => {
  const result = shell.touch(TMP);
  t.falsy(shell.error());
  t.is(result.code, 0);
});

test('creates new files', t => {
  const testFile = tmpFile();
  const result = shell.touch(testFile);
  t.truthy(fs.existsSync(testFile));
  t.is(result.code, 0);
});

test('does not create a file if told not to', t => {
  const testFile = tmpFile(true);
  const result = shell.touch('-c', testFile);
  t.is(result.code, 0);
  t.falsy(fs.existsSync(testFile));
});

test('handles globs correctly', t => {
  shell.touch(`${TMP}/file.txt`);
  shell.touch(`${TMP}/file.js`);
  const result = shell.touch(`${TMP}/file*`);
  t.is(result.code, 0);
  const files = shell.ls(`${TMP}/file*`);
  t.truthy(files.indexOf(`${TMP}/file.txt`) > -1);
  t.truthy(files.indexOf(`${TMP}/file.js`) > -1);
  t.is(files.length, 2);
});

test('errors if reference file is not found', t => {
  const testFile = tmpFile();
  const refFile = tmpFile(true);
  const result = shell.touch({ '-r': refFile }, testFile);
  t.is(result.code, 1);
  t.truthy(shell.error());
});

test('uses a reference file for mtime', t => {
  const testFile = tmpFile(false);
  const testFile2 = tmpFile();
  shell.touch(testFile2);
  utils.sleep(1000);
  let result = shell.touch(testFile);
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.not(
    fs.statSync(testFile).mtime.getTime(),
    fs.statSync(testFile2).mtime.getTime()
  );
  t.not(
    fs.statSync(testFile).atime.getTime(),
    fs.statSync(testFile2).atime.getTime()
  );
  result = shell.touch({ '-r': testFile2 }, testFile);
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(
    fs.statSync(testFile).mtime.getTime(),
    fs.statSync(testFile2).mtime.getTime()
  );
  t.is(
    fs.statSync(testFile).atime.getTime(),
    fs.statSync(testFile2).atime.getTime()
  );
});

test('sets mtime', t => {
  const testFile = tmpFile();
  const oldStat = resetUtimes(testFile);
  const result = shell.touch(testFile);
  t.is(result.code, 0);
  t.truthy(oldStat.mtime < fs.statSync(testFile).mtime);
  // sets atime
  t.truthy(oldStat.atime < fs.statSync(testFile).atime);
});

test('does not set mtime if told not to', t => {
  const testFile = tmpFile();
  const oldStat = resetUtimes(testFile);
  const result = shell.touch('-a', testFile);
  t.is(result.code, 0);
  t.is(oldStat.mtime.getTime(), fs.statSync(testFile).mtime.getTime());
});

test('does not set atime if told not to', t => {
  const testFile = tmpFile();
  const oldStat = resetUtimes(testFile);
  const result = shell.touch('-m', testFile);
  t.is(result.code, 0);
  t.is(oldStat.atime.getTime(), fs.statSync(testFile).atime.getTime());
});

test('multiple files', t => {
  const testFile = tmpFile(true);
  const testFile2 = tmpFile(true);
  shell.rm('-f', testFile, testFile2);
  const result = shell.touch(testFile, testFile2);
  t.is(result.code, 0);
  t.truthy(fs.existsSync(testFile));
  t.truthy(fs.existsSync(testFile2));
});

test('file array', t => {
  const testFile = tmpFile(true);
  const testFile2 = tmpFile(true);
  shell.rm('-f', testFile, testFile2);
  const result = shell.touch([testFile, testFile2]);
  t.is(result.code, 0);
  t.truthy(fs.existsSync(testFile));
  t.truthy(fs.existsSync(testFile2));
});

test('touching broken link creates a new file', t => {
  if (process.platform !== 'win32') {
    const result = shell.touch('resources/badlink');
    t.is(result.code, 0);
    t.falsy(shell.error());
    t.truthy(fs.existsSync('resources/not_existed_file'));
    shell.rm('resources/not_existed_file');
  }
});
