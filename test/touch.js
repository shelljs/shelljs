const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const test = require('ava');

const shell = require('..');
const common = require('../src/common');
const utils = require('./utils/utils');

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
  t.truthy(files.includes(`${t.context.tmp}/file.txt`));
  t.truthy(files.includes(`${t.context.tmp}/file.js`));
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

test('accepts long option (--date)', t => {
  const testFile = tmpFile(t);
  const someDate = new Date('December 17, 1995 03:24:00');
  const result = shell.touch({ date: someDate }, testFile);
  t.is(result.code, 0);
  // Compare getTime(), because Date can't be compared with triple-equals.
  t.is(common.statFollowLinks(testFile).mtime.getTime(), someDate.getTime());
  t.is(common.statFollowLinks(testFile).atime.getTime(), someDate.getTime());
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
    shell.ln('-s', 'not_existed_file', `${t.context.tmp}/badlink2`);
    const result = shell.touch(`${t.context.tmp}/badlink2`);
    t.is(result.code, 0);
    t.falsy(shell.error());
    t.truthy(fs.existsSync(`${t.context.tmp}/not_existed_file`));
  });
});

['a', 'm'].forEach(flag => {
  const selectedTime = flag === 'a' ? 'atime' : 'mtime';
  const preservedTime = flag === 'a' ? 'mtime' : 'atime';

  test(`-${flag} creates a missing file`, t => {
    const file = tmpFile(t, true);
    const before = Date.now();
    const result = shell.touch(`-${flag}`, file);
    const stat = fs.statSync(file);
    t.is(result.code, 0);
    t.falsy(shell.error());
    t.is(stat.size, 0);
    t.true(stat.atime.getTime() >= before - 2000);
    t.true(stat.mtime.getTime() >= before - 2000);
    t.true(stat.atime.getTime() <= Date.now() + 2000);
    t.true(stat.mtime.getTime() <= Date.now() + 2000);
  });

  test(`-${flag} with a date preserves the other new-file timestamp`, t => {
    const file = tmpFile(t, true);
    const date = new Date('2000-01-02T03:04:05Z');
    const before = Date.now();
    const result = shell.touch({ [`-${flag}`]: true, '-d': date }, file);
    const stat = fs.statSync(file);
    t.is(result.code, 0);
    t.falsy(shell.error());
    t.is(stat[selectedTime].getTime(), date.getTime());
    t.true(stat[preservedTime].getTime() >= before - 2000);
    t.true(stat[preservedTime].getTime() <= Date.now() + 2000);
  });

  test(`-${flag} uses reference times when creating a file`, t => {
    const file = tmpFile(t, true);
    const reference = tmpFile(t);
    fs.utimesSync(reference, new Date('2000-01-02T03:04:05Z'), new Date('2001-02-03T04:05:06Z'));
    const referenceStat = fs.statSync(reference);
    const before = Date.now();
    const result = shell.touch({ [`-${flag}`]: true, '-r': reference }, file);
    const stat = fs.statSync(file);
    t.is(result.code, 0);
    t.falsy(shell.error());
    t.is(stat[selectedTime].getTime(), referenceStat[selectedTime].getTime());
    t.true(stat[preservedTime].getTime() >= before - 2000);
    t.true(stat[preservedTime].getTime() <= Date.now() + 2000);
  });

  test(`-${flag} handles missing and existing files in one call`, t => {
    const missing = tmpFile(t, true);
    const existing = tmpFile(t);
    fs.writeFileSync(existing, 'keep this content');
    const oldStat = resetUtimes(existing);
    const date = new Date('2010-01-02T03:04:05Z');
    const result = shell.touch({ [`-${flag}`]: true, '-d': date }, [missing, existing]);
    t.is(result.code, 0);
    t.falsy(shell.error());
    t.is(fs.statSync(missing)[selectedTime].getTime(), date.getTime());
    t.is(fs.statSync(existing)[selectedTime].getTime(), date.getTime());
    t.is(fs.statSync(existing)[preservedTime].getTime(), oldStat[preservedTime].getTime());
    t.is(fs.readFileSync(existing, 'utf8'), 'keep this content');
  });

  test(`-${flag} with -c still leaves missing files absent`, t => {
    const file = tmpFile(t, true);
    const result = shell.touch(`-${flag}c`, file);
    t.is(result.code, 0);
    t.falsy(shell.error());
    t.false(fs.existsSync(file));
  });

  test(`-${flag} creates the target of a dangling symlink`, t => {
    utils.skipOnWin(t, () => {
      const target = tmpFile(t, true);
      const link = tmpFile(t, true);
      fs.symlinkSync(path.resolve(target), link);
      const date = new Date('2000-01-02T03:04:05Z');
      const result = shell.touch({ [`-${flag}`]: true, '-d': date }, link);
      t.is(result.code, 0);
      t.falsy(shell.error());
      t.true(fs.lstatSync(link).isSymbolicLink());
      t.is(fs.statSync(target).size, 0);
      t.is(fs.statSync(target)[selectedTime].getTime(), date.getTime());
    });
  });
});

test('-am sets both timestamps when creating a file', t => {
  const file = tmpFile(t, true);
  const date = new Date('2000-01-02T03:04:05Z');
  const result = shell.touch({ '-a': true, '-m': true, '-d': date }, file);
  const stat = fs.statSync(file);
  t.is(result.code, 0);
  t.falsy(shell.error());
  t.is(stat.atime.getTime(), date.getTime());
  t.is(stat.mtime.getTime(), date.getTime());
});
