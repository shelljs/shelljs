import test from 'ava';

import shell from '..';

const CWD = process.cwd();

test.beforeEach(() => {
  shell.config.resetForTesting();
  process.chdir(CWD);
});

//
// Invalids
//

test('no args', t => {
  const result = shell.find();
  t.is(result.code, 1);
  t.truthy(shell.error());
});

//
// Valids
//

test('current path', t => {
  shell.cd('test/resources/find');
  const result = shell.find('.');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.truthy(result.indexOf('.hidden') > -1);
  t.truthy(result.indexOf('dir1/dir11/a_dir11') > -1);
  t.is(result.length, 11);
  shell.cd('../..');
});

test('simple path', t => {
  const result = shell.find('test/resources/find');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.truthy(result.indexOf('test/resources/find/.hidden') > -1);
  t.truthy(result.indexOf('test/resources/find/dir1/dir11/a_dir11') > -1);
  t.is(result.length, 11);
});

test('multiple paths - comma', t => {
  const result = shell.find('test/resources/find/dir1', 'test/resources/find/dir2');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.truthy(result.indexOf('test/resources/find/dir1/dir11/a_dir11') > -1);
  t.truthy(result.indexOf('test/resources/find/dir2/a_dir1') > -1);
  t.is(result.length, 6);
});

test('multiple paths - array', t => {
  const result = shell.find(['test/resources/find/dir1', 'test/resources/find/dir2']);
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.truthy(result.indexOf('test/resources/find/dir1/dir11/a_dir11') > -1);
  t.truthy(result.indexOf('test/resources/find/dir2/a_dir1') > -1);
  t.is(result.length, 6);
});

test('nonexistent path', t => {
  const result = shell.find('test/resources/find/nonexistent');
  t.is(shell.error(), 'find: no such file or directory: test/resources/find/nonexistent');
  t.is(result.code, 1);
});
