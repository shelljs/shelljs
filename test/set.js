import test from 'ava';
import shell from '..';

let TMP;

let oldConfigSilent;

test.beforeEach(() => {
  TMP = require('./utils/utils').getTempDir();
  oldConfigSilent = shell.config.silent;
  shell.config.silent = true;

  shell.rm('-rf', TMP);
  shell.cp('-r', 'resources', TMP);
});

const nodeVersion = process.versions.node.split('.').map(str => parseInt(str, 10));
const uncaughtErrorExitCode = (nodeVersion[0] === 0 && nodeVersion[1] < 11) ? 8 : 1;

//
// Valids
//

test('initial values', t => {
  t.true(oldConfigSilent === false);
  t.true(shell.config.verbose === false);
  t.true(shell.config.fatal === false);
  t.true(shell.config.noglob === false);
});

test('default behavior', t => {
  const result = shell.exec(JSON.stringify(process.execPath) + ' -e "require(\'../global\'); ls(\'file_doesnt_exist\'); echo(1234);"');
  t.is(result.code, 0);
  t.is(result.stdout, '1234\n');
  t.is(result.stderr, 'ls: no such file or directory: file_doesnt_exist\n');
});

test('set -e', t => {
  const result = shell.exec(JSON.stringify(process.execPath) + ' -e "require(\'../global\'); set(\'-e\'); ls(\'file_doesnt_exist\'); echo(1234);"');
  t.is(result.code, uncaughtErrorExitCode);
  t.is(result.stdout, '');
  t.truthy(result.stderr.indexOf('Error: ls: no such file or directory: file_doesnt_exist') >= 0);
});

test('set -v', t => {
  const result = shell.exec(JSON.stringify(process.execPath) + ' -e "require(\'../global\'); set(\'-v\'); ls(\'file_doesnt_exist\'); echo(1234);"');
  t.is(result.code, 0);
  t.is(result.stdout, '1234\n');
  t.is(
    result.stderr,
    'ls file_doesnt_exist\nls: no such file or directory: file_doesnt_exist\necho 1234\n'
  );
});

test('set -ev', t => {
  const result = shell.exec(JSON.stringify(process.execPath) + ' -e "require(\'../global\'); set(\'-ev\'); ls(\'file_doesnt_exist\'); echo(1234);"');
  t.is(result.code, uncaughtErrorExitCode);
  t.is(result.stdout, '');
  t.truthy(result.stderr.indexOf('Error: ls: no such file or directory: file_doesnt_exist') >= 0);
  t.truthy(result.stderr.indexOf('ls file_doesnt_exist\n') >= 0);
  t.is(result.stderr.indexOf('echo 1234\n'), -1);
});

test('set -e, set +e', t => {
  const result = shell.exec(JSON.stringify(process.execPath) + ' -e "require(\'../global\'); set(\'-e\'); set(\'+e\'); ls(\'file_doesnt_exist\'); echo(1234);"');
  t.is(result.code, 0);
  t.is(result.stdout, '1234\n');
  t.is(result.stderr, 'ls: no such file or directory: file_doesnt_exist\n');
});

test('set -f', t => {
  shell.set('-f'); // disable globbing
  shell.rm(`${TMP}/*.txt`);
  t.truthy(shell.error()); // file '*.txt' doesn't exist, so rm() fails
  shell.set('+f');
  shell.rm(`${TMP}/*.txt`);
  t.falsy(shell.error()); // globbing works, so rm succeeds
});

