import test from 'ava';

import shell from '..';
import utils from './utils/utils';

const oldConfigSilent = shell.config.silent;
const uncaughtErrorExitCode = 1;

test.beforeEach(t => {
  t.context.tmp = utils.getTempDir();
  shell.config.resetForTesting();
  shell.cp('-r', 'test/resources', t.context.tmp);
});

test.afterEach.always(t => {
  shell.rm('-rf', t.context.tmp);
});

//
// Valids
//

test('initial values', t => {
  t.false(oldConfigSilent);
  t.false(shell.config.verbose);
  t.false(shell.config.fatal);
  t.false(shell.config.noglob);
});

test('default behavior', t => {
  const result = shell.exec(JSON.stringify(shell.config.execPath) + ' -e "require(\'./global\'); ls(\'file_doesnt_exist\'); echo(1234);"');
  t.is(result.code, 0);
  t.is(result.stdout, '1234\n');
  t.is(result.stderr, 'ls: no such file or directory: file_doesnt_exist\n');
});

test('set -e', t => {
  const result = shell.exec(JSON.stringify(shell.config.execPath) + ' -e "require(\'./global\'); set(\'-e\'); ls(\'file_doesnt_exist\'); echo(1234);"');
  t.is(result.code, uncaughtErrorExitCode);
  t.is(result.stdout, '');
  t.truthy(result.stderr.indexOf('Error: ls: no such file or directory: file_doesnt_exist') >= 0);
});

test('set -v', t => {
  const result = shell.exec(JSON.stringify(shell.config.execPath) + ' -e "require(\'./global\'); set(\'-v\'); ls(\'file_doesnt_exist\'); echo(1234);"');
  t.is(result.code, 0);
  t.is(result.stdout, '1234\n');
  t.is(
    result.stderr,
    'ls file_doesnt_exist\nls: no such file or directory: file_doesnt_exist\necho 1234\n'
  );
});

test('set -ev', t => {
  const result = shell.exec(JSON.stringify(shell.config.execPath) + ' -e "require(\'./global\'); set(\'-ev\'); ls(\'file_doesnt_exist\'); echo(1234);"');
  t.is(result.code, uncaughtErrorExitCode);
  t.is(result.stdout, '');
  t.truthy(result.stderr.indexOf('Error: ls: no such file or directory: file_doesnt_exist') >= 0);
  t.truthy(result.stderr.indexOf('ls file_doesnt_exist\n') >= 0);
  t.is(result.stderr.indexOf('echo 1234\n'), -1);
});

test('set -e, set +e', t => {
  const result = shell.exec(JSON.stringify(shell.config.execPath) + ' -e "require(\'./global\'); set(\'-e\'); set(\'+e\'); ls(\'file_doesnt_exist\'); echo(1234);"');
  t.is(result.code, 0);
  t.is(result.stdout, '1234\n');
  t.is(result.stderr, 'ls: no such file or directory: file_doesnt_exist\n');
});

test('set -f', t => {
  shell.set('-f'); // disable globbing
  shell.rm(`${t.context.tmp}/*.txt`);
  t.truthy(shell.error()); // file '*.txt' doesn't exist, so rm() fails
  shell.set('+f');
  shell.rm(`${t.context.tmp}/*.txt`);
  t.falsy(shell.error()); // globbing works, so rm succeeds
});
