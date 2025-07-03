const test = require('ava');

const shell = require('..');

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
  t.truthy(result.includes('.hidden'));
  t.truthy(result.includes('dir1/dir11/a_dir11'));
  t.is(result.length, 12);
  shell.cd('../..');
});

test('simple path', t => {
  const result = shell.find('test/resources/find');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.truthy(result.includes('test/resources/find/.hidden'));
  t.truthy(result.includes('test/resources/find/dir1/dir11/a_dir11'));
  t.is(result.length, 12);
});

test('absolute path', t => {
  const result = shell.find(`${process.cwd()}/test/resources/find`);
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.truthy(result.includes(`${process.cwd()}/test/resources/find/.hidden`));
  t.truthy(result.includes(`${process.cwd()}/test/resources/find/dir1/dir11/a_dir11`));
  t.is(result.length, 12);
});

test('multiple paths - comma', t => {
  const result = shell.find('test/resources/find/dir1', 'test/resources/find/dir2');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.truthy(result.includes('test/resources/find/dir1/dir11/a_dir11'));
  t.truthy(result.includes('test/resources/find/dir2/a_dir1'));
  t.is(result.length, 6);
});

test('multiple paths - array', t => {
  const result = shell.find(['test/resources/find/dir1', 'test/resources/find/dir2']);
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.truthy(result.includes('test/resources/find/dir1/dir11/a_dir11'));
  t.truthy(result.includes('test/resources/find/dir2/a_dir1'));
  t.is(result.length, 6);
});

test('nonexistent path', t => {
  const result = shell.find('test/resources/find/nonexistent');
  t.is(shell.error(), 'find: no such file or directory: test/resources/find/nonexistent');
  t.is(result.code, 1);
});

test('-L flag, folder is symlinked', t => {
  const result = shell.find('-L', 'test/resources/find');
  t.falsy(shell.error());
  t.is(result.code, 0);
  t.truthy(result.includes('test/resources/find/dir2_link/a_dir1'));
  t.is(result.length, 13);
});
