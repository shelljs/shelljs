import test from 'ava';
import shell from '..';

let TMP;

test.beforeEach(() => {
  TMP = require('./utils/utils').getTempDir();
  shell.config.silent = true;

  shell.rm('-rf', TMP);
  shell.mkdir(TMP);
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
  shell.cd('resources/find');
  const result = shell.find('.');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.indexOf('.hidden') > -1, true);
  t.is(result.indexOf('dir1/dir11/a_dir11') > -1, true);
  t.is(result.length, 11);
  shell.cd('../..');
});

test('simple path', t => {
  const result = shell.find('resources/find');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.indexOf('resources/find/.hidden') > -1, true);
  t.is(result.indexOf('resources/find/dir1/dir11/a_dir11') > -1, true);
  t.is(result.length, 11);
});

test('multiple paths - comma', t => {
  const result = shell.find('resources/find/dir1', 'resources/find/dir2');
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.indexOf('resources/find/dir1/dir11/a_dir11') > -1, true);
  t.is(result.indexOf('resources/find/dir2/a_dir1') > -1, true);
  t.is(result.length, 6);
});

test('multiple paths - array', t => {
  const result = shell.find(['resources/find/dir1', 'resources/find/dir2']);
  t.is(shell.error(), null);
  t.is(result.code, 0);
  t.is(result.indexOf('resources/find/dir1/dir11/a_dir11') > -1, true);
  t.is(result.indexOf('resources/find/dir2/a_dir1') > -1, true);
  t.is(result.length, 6);
});
