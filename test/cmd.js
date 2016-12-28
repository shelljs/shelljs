import path from 'path';
import os from 'os';

import test from 'ava';

import shell from '..';
import common from '../src/common';

shell.config.silent = true;
const oldFatal = shell.config.fatal;

test.afterEach.always(() => {
  shell.config.fatal = oldFatal;
});

//
// Invalids
//

test('no args', t => {
  shell.cmd();
  t.truthy(shell.error());
});

test('could not find command', t => {
  const result = shell.cmd('asdfasdf'); // could not find command
  t.not(result.code, 0);
});

test('Test fatal mode for cmd, temporarily overriding process.exit', t => {
  shell.config.fatal = true;
  t.throws(() => {
    shell.cmd('asdfasdf'); // could not find command
  }, 'cmd: command not found: asdfasdf');
});

//
// Valids
//

//
// sync
//

test('check if stdout goes to output', t => {
  const result = shell.cmd(common.nodeBinPath, '-e', 'console.log(1234);');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.stdout, '1234\n');
});

test('check if stderr goes to output', t => {
  const result = shell.cmd(common.nodeBinPath, '-e', 'console.error(1234);');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(typeof result.stdout, 'string');
  t.is(typeof result.stderr, 'string');
  t.is(result.stdout, '');
  t.is(result.stderr, '1234\n');
});

test('check if stdout + stderr go to output', t => {
  const result = shell.cmd(common.nodeBinPath, '-e', 'console.error(1234); console.log(666);');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.stdout, '666\n');
  t.is(result.stderr, '1234\n');
});

test('check exit code', t => {
  const result = shell.cmd(common.nodeBinPath, '-e', 'process.exit(12);');
  t.truthy(shell.error());
  t.is(result.code, 12);
});

test('interaction with cd', t => {
  shell.cd('resources/external');
  const result = shell.cmd(common.nodeBinPath, 'node_script.js');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.stdout, 'node_script_1234\n');
  shell.cd('../..');
});

test('set cwd', t => {
  const result = shell.cmd('shx', 'pwd', { cwd: '..' });
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.is(result.stdout, path.resolve('..') + os.EOL);
});

test('supports globbing by default', t => {
  const result = shell.cmd('echo', 'resources/*.txt');
  t.is(result.stdout, 'resources/a.txt resources/file1.txt resources/file2.txt\n');
  t.is(result.stderr, '');
  t.falsy(shell.error());
});

test('globbing can be disabled', t => {
  shell.set('-f');
  const result = shell.cmd('echo', 'resources/*.txt');
  t.is(result.stdout, 'resources/*.txt\n');
  t.is(result.stderr, '');
  t.falsy(shell.error());
  shell.set('+f');
});

test('cmd returns a ShellString', t => {
  const result = shell.cmd('echo', 'foo');
  t.is(typeof result, 'object');
  t.truthy(result instanceof String);
  t.is(typeof result.stdout, 'string');
  t.is(result.toString(), result.stdout);
});

// TODO(nate): make it exactly equivalent to stderr, unless stderr === ''
test.skip('shell.error() contains the stderr of external command in the case of an error', t => {
  const result = shell.cmd(common.nodeBinPath, '-e', 'console.error(1234); process.exit(3);');
  t.is(shell.error(), result.stderr);
  t.is(result.code, 3);
  t.is(result.stdout, '');
  // TODO(nate): fix the 'internal error' that I'm seeing
  t.is(result.stderr, '1234\n');
});

test('option: realtimeOutput === false', t => {
  const result = shell.cmd(common.nodeBinPath, '-e', 'console.error(1234); console.log(5678);', {
    realtimeOutput: false,
  });
  t.falsy(shell.error());
  t.is(typeof result.stdout, 'string');
  t.is(typeof result.stderr, 'string');
  t.is(result.code, 0);
  t.is(result.stdout, '5678\n');
  t.is(result.stderr, '1234\n');
});

test('cmd works, even if it\'s piped while in silent mode', t => {
  const result = shell.ShellString('foo bar baz').cmd('cat', { silent: true });
  t.is(typeof result, 'object');
  t.truthy(result instanceof String);
  t.is(result.stdout, 'foo bar baz');
});
