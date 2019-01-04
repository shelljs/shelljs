import crypto from 'crypto';
import fs from 'fs';

import test from 'ava';

import shell from '..';
import common from '../src/common';
import utils from './utils/utils';

test.beforeEach(t => {
  t.context.tmp = utils.getTempDir();
  shell.config.resetForTesting();
  shell.mkdir(t.context.tmp);
});

test.afterEach.always(t => {
  shell.rm('-rf', t.context.tmp);
});

// Helper functions
function resetUtimes(f) {
  const d = new Date();
  d.setYear(2000);
  fs.utimesSync(f, d, d);
  return common.statFollowLinks(f);
}

function tmpFile(t, noCreate) {
  const str = crypto.randomBytes(Math.ceil(10 / 2)).toString('hex');
  const file = `${t.context.tmp}/${str}`;
  if (!noCreate) {
    fs.closeSync(fs.openSync(file, 'a'));
  }
  return file;
}


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
  const result = shell.touch(t.context.tmp);
  t.falsy(shell.error());
  t.is(result.code, 0);
});

test('creates new files', t => {
  const testFile = tmpFile(t);
  const result = shell.touch(testFile);
  t.truthy(fs.existsSync(testFile));
  t.is(result.code, 0);
});

test('does not create a file if told not to', t => {
  const testFile = tmpFile(t, true);
  const result = shell.touch('-c', testFile);
  t.is(result.code, 0);
  t.falsy(fs.existsSync(testFile));
});

test('handles globs correctly', t => {
  shell.touch(`${t.context.tmp}/file.txt`);
  shell.touch(`${t.context.tmp}/file.js`);
  const result = shell.touch(`${t.context.tmp}/file*`);
  t.is(result.code, 0);
  const files = shell.ls(`${t.context.tmp}/file*`);
  t.truthy(files.indexOf(`${t.context.tmp}/file.txt`) > -1);
  t.truthy(files.indexOf(`${t.context.tmp}/file.js`) > -1);
  t.is(files.length, 2);
});

test('errors if reference file is not found', t => {
  const testFile = tmpFile(t);
  const refFile = tmpFile(t, true);
  const result = shell.touch({ '-r': refFile }, testFile);
  t.is(result.code, 1);
  t.truthy(shell.error());
});

test('uses a reference file for mtime', t => {
  const testFile = tmpFile(t);
  const testFile2 = tmpFile(t);
  shell.touch(testFile2);
  utils.sleep(1000);
  let result = shell.touch(testFile);
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.not(
    common.statFollowLinks(testFile).mtime.getTime(),
    common.statFollowLinks(testFile2).mtime.getTime()
  );
  t.not(
    common.statFollowLinks(testFile).atime.getTime(),
    common.statFollowLinks(testFile2).atime.getTime()
  );
  result = shell.touch({ '-r': testFile2 }, testFile);
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(
    common.statFollowLinks(testFile).mtime.getTime(),
    common.statFollowLinks(testFile2).mtime.getTime()
  );
  t.is(
    common.statFollowLinks(testFile).atime.getTime(),
    common.statFollowLinks(testFile2).atime.getTime()
  );
});

test('accepts -d flag', t => {
  const testFile = tmpFile(t);
  const date = new Date('December 17, 1995 03:24:00');
  const result = shell.touch({ '-d': date }, testFile);
  t.is(result.code, 0);
  // Compare getTime(), because Date can't be compared with triple-equals.
  t.is(common.statFollowLinks(testFile).mtime.getTime(), date.getTime());
  t.is(common.statFollowLinks(testFile).atime.getTime(), date.getTime());
});

test('accepts long option (date)', t => {
  const testFile = tmpFile(t);
  const date = new Date('December 17, 1995 03:24:00');
  const result = shell.touch({ date }, testFile);
  t.is(result.code, 0);
  // Compare getTime(), because Date can't be compared with triple-equals.
  t.is(common.statFollowLinks(testFile).mtime.getTime(), date.getTime());
  t.is(common.statFollowLinks(testFile).atime.getTime(), date.getTime());
});

test('sets mtime and atime by default', t => {
  const testFile = tmpFile(t);
  const oldStat = resetUtimes(testFile);
  const result = shell.touch(testFile);
  t.is(result.code, 0);
  t.truthy(oldStat.mtime < common.statFollowLinks(testFile).mtime);
  t.truthy(oldStat.atime < common.statFollowLinks(testFile).atime);
});

test('does not set mtime if told not to', t => {
  const testFile = tmpFile(t);
  const oldStat = resetUtimes(testFile);
  const result = shell.touch('-a', testFile);
  t.is(result.code, 0);
  t.is(oldStat.mtime.getTime(), common.statFollowLinks(testFile).mtime.getTime());
});

test('does not set atime if told not to', t => {
  const testFile = tmpFile(t);
  const oldStat = resetUtimes(testFile);
  const result = shell.touch('-m', testFile);
  t.is(result.code, 0);
  t.is(oldStat.atime.getTime(), common.statFollowLinks(testFile).atime.getTime());
});

test('multiple files', t => {
  const testFile = tmpFile(t, true);
  const testFile2 = tmpFile(t, true);
  shell.rm('-f', testFile, testFile2);
  const result = shell.touch(testFile, testFile2);
  t.is(result.code, 0);
  t.truthy(fs.existsSync(testFile));
  t.truthy(fs.existsSync(testFile2));
});

test('file array', t => {
  const testFile = tmpFile(t, true);
  const testFile2 = tmpFile(t, true);
  shell.rm('-f', testFile, testFile2);
  const result = shell.touch([testFile, testFile2]);
  t.is(result.code, 0);
  t.truthy(fs.existsSync(testFile));
  t.truthy(fs.existsSync(testFile2));
});

test('touching broken link creates a new file', t => {
  utils.skipOnWin(t, () => {
    const result = shell.touch('test/resources/badlink');
    t.is(result.code, 0);
    t.falsy(shell.error());
    t.truthy(fs.existsSync('test/resources/not_existed_file'));
    shell.rm('test/resources/not_existed_file');
  });
});
